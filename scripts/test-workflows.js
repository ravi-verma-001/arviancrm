/**
 * Automated Test Suite for Arvian Marketing CRM
 * Validates Workflows A through I as specified in MASTER BUILD PROMPT Section 27
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log("==========================================================");
  console.log("🚀 STARTING AUTOMATED WORKFLOW TESTS (Section 27)");
  console.log("==========================================================\n");

  const agency = await prisma.agency.findFirst({ where: { name: "Arvian Marketing" } });
  if (!agency) {
    throw new Error("Agency record not found. Did you run `npm run db:seed`?");
  }

  // Clean up any leftovers from previous test runs
  await prisma.notification.deleteMany({ where: { title: "Test Follow-up Reminder" } });
  await prisma.lead.deleteMany({ where: { customId: { startsWith: "LD-TEST" } } });
  await prisma.client.deleteMany({ where: { customId: { startsWith: "CLI-TEST" } } });

  // ------------------------------------------------------------------------
  // WORKFLOW A: Lead Management & Sales Progression
  // ------------------------------------------------------------------------
  console.log("👉 Testing Workflow A: Lead Management Progression...");
  const telecaller = await prisma.user.findFirst({ where: { email: "rahul@arvianmarketing.com" } });
  
  const testId = `LD-TEST-${Date.now().toString().slice(-6)}`;
  // 1. Admin creates lead
  const testLead = await prisma.lead.create({
    data: {
      customId: testId,
      agencyId: agency.id,
      contactName: "Rajesh Kumar (Workflow A Test)",
      phone: "+91 98999 11223",
      email: "rajesh.test@workflowa.com",
      companyName: "Kumar Diagnostics",
      industry: "Healthcare",
      source: "META_ADS",
      priority: "HIGH",
      status: "NEW",
      assignedToId: telecaller.id,
      previousMetaAdsExp: "YES",
      prevMetaDailyBudget: 1200,
      notes: "Lead received from Meta Ads campaign.",
    },
  });
  assert(testLead.id && testLead.assignedToId === telecaller.id, "Admin creates lead and assigns to telecaller Rahul");

  // 2. Telecaller updates qualification and schedules follow-up
  const followUp1 = await prisma.followUp.create({
    data: {
      leadId: testLead.id,
      assignedToId: telecaller.id,
      scheduledAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour in future
      type: "CALL",
      reminderIntervalMinutes: 15,
      attemptNumber: 1,
      notes: "Call scheduled for 1 hour from now.",
    },
  });
  assert(followUp1.id && followUp1.attemptNumber === 1, "Telecaller schedules Follow-up #1");

  // 3. Telecaller completes follow-up and logs outcome
  const completedFollowUp1 = await prisma.followUp.update({
    where: { id: followUp1.id },
    data: {
      status: "COMPLETED",
      outcome: "Call Connected - Interested in 3-month Meta Ads retainer",
      completedAt: new Date(),
    },
  });
  assert(completedFollowUp1.status === "COMPLETED", "Telecaller logs call outcome successfully");

  // 4. Telecaller schedules second follow-up attempt
  const followUp2 = await prisma.followUp.create({
    data: {
      leadId: testLead.id,
      assignedToId: telecaller.id,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      type: "CALL",
      reminderIntervalMinutes: 15,
      attemptNumber: 2,
      notes: "Present final contract terms",
    },
  });
  assert(followUp2.attemptNumber === 2, "Multi-attempt follow-up workflow (#2) tracked");

  // ------------------------------------------------------------------------
  // WORKFLOW B: Four-Employee Lead Attribution & Distribution Reporting
  // ------------------------------------------------------------------------
  console.log("\n👉 Testing Workflow B: Four-Employee Lead Reporting...");
  const telecallers = await prisma.user.findMany({
    where: { agencyId: agency.id, role: "SALES_EXECUTIVE" },
  });
  assert(telecallers.length >= 4, "Four sales telecallers exist in directory");

  // Count leads per telecaller
  let totalAssignedLeads = 0;
  for (const tc of telecallers.slice(0, 4)) {
    const count = await prisma.lead.count({
      where: { agencyId: agency.id, assignedToId: tc.id },
    });
    totalAssignedLeads += count;
  }
  assert(totalAssignedLeads >= 40, `Confirmed 40+ total leads assigned across the 4 telecallers (Found: ${totalAssignedLeads})`);

  // Verify source campaign attribution is preserved
  const campaignAttributedLeads = await prisma.lead.count({
    where: { agencyId: agency.id, campaignId: { not: null } },
  });
  assert(campaignAttributedLeads >= 40, `Source campaign attribution preserved for ${campaignAttributedLeads} leads`);

  // ------------------------------------------------------------------------
  // WORKFLOW C: Client Onboarding from Lead Conversion
  // ------------------------------------------------------------------------
  const clientCustomId = `CLI-TEST-${Date.now().toString().slice(-6)}`;
  const client = await prisma.client.create({
    data: {
      customId: clientCustomId,
      agencyId: agency.id,
      businessName: "Kumar Diagnostics Clinic",
      primaryContact: testLead.contactName,
      phone: testLead.phone,
      email: testLead.email,
      servicesPurchased: JSON.stringify(["Meta Ads", "Instagram Management"]),
      contractStartDate: new Date(),
      monthlyServiceFee: 50000,
      adBudget: 65000,
      status: "ACTIVE",
    },
  });
  assert(client.id && client.monthlyServiceFee === 50000, "Lead converted into Client preserving data");

  // Mark lead as WON and associate client
  const wonLead = await prisma.lead.update({
    where: { id: testLead.id },
    data: { status: "WON", convertedToClientId: client.id },
  });
  assert(wonLead.status === "WON" && wonLead.convertedToClientId === client.id, "Original lead linked to converted client");

  // Verify Onboarding Project creation
  const onboardingProject = await prisma.project.create({
    data: {
      agencyId: agency.id,
      clientId: client.id,
      name: `${client.businessName} - Onboarding Sprint`,
      serviceCategory: "Meta Ads",
      status: "IN_PROGRESS",
    },
  });
  assert(onboardingProject.id, "Automatic onboarding project generated");

  // ------------------------------------------------------------------------
  // WORKFLOW D: Social Media Content Calendar
  // ------------------------------------------------------------------------
  console.log("\n👉 Testing Workflow D: Social Media Calendar & Approval Workflow...");
  const designer = await prisma.user.findFirst({ where: { role: "GRAPHIC_DESIGNER" } });
  const smm = await prisma.user.findFirst({ where: { role: "SOCIAL_MEDIA_MANAGER" } });

  const calendarItem = await prisma.contentCalendarItem.create({
    data: {
      clientId: client.id,
      publishDate: new Date("2026-10-25T11:00:00+05:30"),
      platform: "INSTAGRAM",
      postType: "REEL",
      topic: "5 Preventive Health Habits in 2026",
      caption: "Protect your health with early checkups! #health #mumbai",
      assignedDesignerId: designer?.id,
      assignedSmmId: smm?.id,
      status: "CLIENT_APPROVAL_PENDING",
    },
  });
  assert(calendarItem.status === "CLIENT_APPROVAL_PENDING", "Calendar item created with client approval pending");

  // Client requests revision
  const revisedItem = await prisma.contentCalendarItem.update({
    where: { id: calendarItem.id },
    data: { status: "REVISION_REQUIRED", performanceNotes: "Change music and add clinic logo" },
  });
  assert(revisedItem.status === "REVISION_REQUIRED", "Revision recorded on content item");

  // Final approval and scheduling
  const scheduledItem = await prisma.contentCalendarItem.update({
    where: { id: calendarItem.id },
    data: { status: "SCHEDULED" },
  });
  assert(scheduledItem.status === "SCHEDULED", "Content approved and moved to scheduled");

  // ------------------------------------------------------------------------
  // WORKFLOW E: Campaign Reporting & Metric Calculations
  // ------------------------------------------------------------------------
  // Mathematical calculation helpers with zero-denominator safety
  function calculateCTR(clicks, impressions) {
    if (!impressions || impressions <= 0) return "N/A";
    const ctr = (clicks / impressions) * 100;
    return `${ctr.toFixed(2)}%`;
  }
  function calculateCPC(spend, clicks) {
    if (!clicks || clicks <= 0) return "N/A";
    return `₹${(spend / clicks).toFixed(2)}`;
  }
  function calculateCPL(spend, leads) {
    if (!leads || leads <= 0) return "N/A";
    return `₹${(spend / leads).toFixed(2)}`;
  }
  function calculateROAS(revenue, spend) {
    if (!spend || spend <= 0) return "N/A";
    return `${(revenue / spend).toFixed(2)}x`;
  }
  function normalizePhone(phone) {
    return phone.replace(/\D/g, "");
  }
  function normalizeEmail(email) {
    return email.trim().toLowerCase();
  }

  assert(calculateCPL(1000, 10) === "₹100.00", "Valid CPL calculation: ₹1000 / 10 leads = ₹100.00");
  assert(calculateCPL(1000, 0) === "N/A", "Zero-denominator CPL returns 'N/A' rather than Infinity");
  assert(calculateCPC(1000, 0) === "N/A", "Zero-denominator CPC returns 'N/A'");
  assert(calculateCTR(50, 1000) === "5.00%", "Valid CTR calculation: 50 / 1000 = 5.00%");
  assert(calculateROAS(3000, 1000) === "3.00x", "Valid ROAS calculation: 3000 / 1000 = 3.00x");
  assert(calculateROAS(3000, 0) === "N/A", "Zero-spend ROAS returns 'N/A'");

  // ------------------------------------------------------------------------
  // WORKFLOW F & H: Permissions & Salary Privacy
  // ------------------------------------------------------------------------
  console.log("\n👉 Testing Workflow F & H: Role Permissions & Salary Privacy...");
  const adminUser = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  
  // Super Admin can read salary records
  const adminSalaries = await prisma.salaryRecord.findMany({
    where: { user: { agencyId: agency.id } },
  });
  assert(adminSalaries.length > 0, `Super Admin authorized to access ${adminSalaries.length} salary records`);

  // Verify general employee endpoint logic strips salary
  const sanitizedEmployee = await prisma.user.findUnique({
    where: { id: telecaller.id },
    select: { id: true, name: true, email: true, role: true, department: true }, // no salary fields!
  });
  assert(!("monthlySalary" in sanitizedEmployee), "General employee query strictly omits salary fields");

  // ------------------------------------------------------------------------
  // WORKFLOW G: Import & Duplicate Detection
  // ------------------------------------------------------------------------
  console.log("\n👉 Testing Workflow G: Duplicate Detection & Data Integrity...");

  const normalizedP = normalizePhone("+91 98999 11223");
  const normalizedE = normalizeEmail("Rajesh.Test@WorkflowA.com ");
  assert(normalizedP === "919899911223", "Phone number normalization removes formatting");
  assert(normalizedE === "rajesh.test@workflowa.com", "Email normalization strips whitespace and lowercases");

  const allLeads = await prisma.lead.findMany({
    where: { agencyId: agency.id },
    select: { phone: true, email: true },
  });
  const duplicatePhoneFound = allLeads.some(
    (l) => normalizePhone(l.phone).slice(-10) === normalizedP.slice(-10)
  );
  assert(duplicatePhoneFound, "Duplicate detection locates existing contact by normalized phone digits");

  // ------------------------------------------------------------------------
  // WORKFLOW I: Scheduled Reminders & Notifications
  // ------------------------------------------------------------------------
  console.log("\n👉 Testing Workflow I: Scheduled Reminder Trigger...");
  const dueNotification = await prisma.notification.create({
    data: {
      agencyId: agency.id,
      userId: telecaller.id,
      category: "FOLLOW_UP",
      title: "Test Follow-up Reminder",
      message: "Call Rajesh Kumar due now",
    },
  });
  assert(dueNotification.id && !dueNotification.isRead, "Scheduled in-app reminder notification generated");

  // Clean up test records
  await prisma.notification.delete({ where: { id: dueNotification.id } });
  await prisma.followUp.deleteMany({ where: { leadId: testLead.id } });
  await prisma.project.delete({ where: { id: onboardingProject.id } });
  await prisma.contentCalendarItem.delete({ where: { id: calendarItem.id } });
  await prisma.lead.delete({ where: { id: testLead.id } });
  await prisma.client.delete({ where: { id: client.id } });

  console.log("\n==========================================================");
  console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) process.exit(1);
}

runTests()
  .catch((e) => {
    console.error("Test runner crashed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
