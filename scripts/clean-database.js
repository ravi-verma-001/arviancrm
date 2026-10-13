/**
 * clean-database.js
 * ─────────────────────────────────────────────────────────
 * Wipes ALL dummy / seed data from the production database
 * and creates one clean Agency + Super Admin account.
 *
 * Usage:
 *   node scripts/clean-database.js
 *
 * Environment variables required (same as your .env):
 *   DATABASE_URL, DIRECT_URL, JWT_SECRET (optional here)
 * ─────────────────────────────────────────────────────────
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const prisma = new PrismaClient();

// ── helpers ────────────────────────────────────────────────
function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

// ── main ───────────────────────────────────────────────────
async function main() {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║        ARVIAN CRM — DATABASE CLEANER         ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  const confirm = await ask(
    "⚠️  This will DELETE ALL data from the database.\n" +
    "    Type  YES  to continue, or anything else to cancel: "
  );

  if (confirm !== "YES") {
    console.log("\n❌ Cancelled. No data was changed.\n");
    process.exit(0);
  }

  // ── 1. Collect admin details ──────────────────────────────
  console.log("\n─── New Admin Account Setup ───\n");

  const agencyName  = await ask("Agency / Company Name  (e.g. Arvian Marketing): ");
  const adminName   = await ask("Admin Full Name        (e.g. Ravi Verma): ");
  const adminEmail  = await ask("Admin Email            (e.g. admin@yourdomain.com): ");
  const adminPass   = await ask("Admin Password         (min 8 chars): ");

  if (!agencyName || !adminName || !adminEmail || !adminPass) {
    console.log("\n❌ All fields are required. Exiting.\n");
    process.exit(1);
  }
  if (adminPass.length < 8) {
    console.log("\n❌ Password must be at least 8 characters. Exiting.\n");
    process.exit(1);
  }

  // ── 2. Wipe all tables in dependency order ────────────────
  console.log("\n🗑️  Deleting all existing data...");

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.clientCommunication.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.contentCalendarItem.deleteMany();
  await prisma.clientCreativeAsset.deleteMany();
  await prisma.campaignDailyMetric.deleteMany();
  await prisma.ad.deleteMany();
  await prisma.adSet.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.leadActivity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.client.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.salaryRecord.deleteMany();
  await prisma.user.deleteMany();
  await prisma.integrationConfig.deleteMany();
  await prisma.agency.deleteMany();

  console.log("✅  All tables cleared.\n");

  // ── 3. Create fresh Agency ────────────────────────────────
  const agency = await prisma.agency.create({
    data: {
      name: agencyName,
      timezone: "Asia/Kolkata",
      currency: "INR",
      email: adminEmail,
    },
  });

  // ── 4. Create Super Admin user ────────────────────────────
  const passwordHash = await bcrypt.hash(adminPass, 10);

  const admin = await prisma.user.create({
    data: {
      agencyId:    agency.id,
      employeeId:  "ARV-OWNER-001",
      name:        adminName,
      email:       adminEmail,
      passwordHash,
      role:        "SUPER_ADMIN",
      department:  "Management",
      designation: "Agency Owner",
      status:      "ACTIVE",
    },
  });

  // ── 5. Create default integration placeholders ────────────
  const integrations = ["META_ADS", "WHATSAPP", "EMAIL_SMTP", "GOOGLE_SHEETS"];
  for (const provider of integrations) {
    await prisma.integrationConfig.create({
      data: {
        agencyId: agency.id,
        provider,
        status:   "DISCONNECTED",
        settings: "{}",
      },
    });
  }

  // ── 6. Done ───────────────────────────────────────────────
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║           ✅  DATABASE RESET DONE!           ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log(`\n  Agency : ${agency.name}  (id: ${agency.id})`);
  console.log(`  Admin  : ${admin.name} <${admin.email}>`);
  console.log(`  Role   : SUPER_ADMIN`);
  console.log("\n  Login with the email + password you just set.\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
