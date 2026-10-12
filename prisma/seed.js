const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Arvian Marketing CRM database...");

  // 1. Clean existing records
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

  // 2. Create Agency
  const agency = await prisma.agency.create({
    data: {
      name: "Arvian Marketing",
      timezone: "Asia/Kolkata",
      currency: "INR",
      email: "contact@arvianmarketing.com",
      phone: "+91 98765 43210",
      website: "https://arvianmarketing.com",
      address: "Bandra Kurla Complex, Mumbai, Maharashtra 400051",
    },
  });

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash("admin123", salt);
  const employeePasswordHash = await bcrypt.hash("password123", salt);

  // 3. Create Users / Employees
  // Admin / Agency Owner
  const adminUser = await prisma.user.create({
    data: {
      agencyId: agency.id,
      employeeId: "ARV-OWNER-001",
      name: "Aarav Sharma",
      email: "admin@arvianmarketing.com",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      department: "Management",
      designation: "Agency Founder & CEO",
      phone: "+91 98765 43210",
      status: "ACTIVE",
      workingHours: "09:30 AM - 07:30 PM IST",
      leaveBalance: 24,
    },
  });

  // 4 Sales Executives / Telecallers for Workflow B
  const telecallersData = [
    { empId: "ARV-EMP-101", name: "Rahul Sharma", email: "rahul@arvianmarketing.com", phone: "+91 98111 22331" },
    { empId: "ARV-EMP-102", name: "Priya Patel", email: "priya@arvianmarketing.com", phone: "+91 98222 33442" },
    { empId: "ARV-EMP-103", name: "Amit Verma", email: "amit@arvianmarketing.com", phone: "+91 98333 44553" },
    { empId: "ARV-EMP-104", name: "Neha Gupta", email: "neha@arvianmarketing.com", phone: "+91 98444 55664" },
  ];

  const telecallerUsers = [];
  for (const tc of telecallersData) {
    const user = await prisma.user.create({
      data: {
        agencyId: agency.id,
        employeeId: tc.empId,
        name: tc.name,
        email: tc.email,
        passwordHash: employeePasswordHash,
        role: "SALES_EXECUTIVE",
        department: "Sales / Telecalling",
        designation: "Senior Sales Executive",
        phone: tc.phone,
        status: "ACTIVE",
        managerId: adminUser.id,
        workingHours: "10:00 AM - 07:00 PM IST",
        leaveBalance: 18,
      },
    });
    telecallerUsers.push(user);
  }

  // Graphic Designer
  const designerUser = await prisma.user.create({
    data: {
      agencyId: agency.id,
      employeeId: "ARV-EMP-201",
      name: "Arjun Mehta",
      email: "arjun@arvianmarketing.com",
      passwordHash: employeePasswordHash,
      role: "GRAPHIC_DESIGNER",
      department: "Graphic Design",
      designation: "Lead Creative Designer",
      phone: "+91 98555 66775",
      status: "ACTIVE",
      managerId: adminUser.id,
      workingHours: "10:00 AM - 07:00 PM IST",
      leaveBalance: 18,
    },
  });

  // Social Media Manager
  const smmUser = await prisma.user.create({
    data: {
      agencyId: agency.id,
      employeeId: "ARV-EMP-301",
      name: "Sneha Rao",
      email: "sneha@arvianmarketing.com",
      passwordHash: employeePasswordHash,
      role: "SOCIAL_MEDIA_MANAGER",
      department: "Social Media Management",
      designation: "Senior Social Media Strategist",
      phone: "+91 98666 77886",
      status: "ACTIVE",
      managerId: adminUser.id,
      workingHours: "10:00 AM - 07:00 PM IST",
      leaveBalance: 18,
    },
  });

  // Meta Ads Manager
  const mediaBuyerUser = await prisma.user.create({
    data: {
      agencyId: agency.id,
      employeeId: "ARV-EMP-401",
      name: "Karan Malhotra",
      email: "karan@arvianmarketing.com",
      passwordHash: employeePasswordHash,
      role: "META_ADS_MANAGER",
      department: "Meta Ads",
      designation: "Performance Marketing Lead",
      phone: "+91 98777 88997",
      status: "ACTIVE",
      managerId: adminUser.id,
      workingHours: "10:00 AM - 07:00 PM IST",
      leaveBalance: 18,
    },
  });

  // 4. Create Salaries (Restricted to Super Admin)
  const salaryData = [
    { user: adminUser, base: 150000, allowances: 25000, deductions: 5000 },
    { user: telecallerUsers[0], base: 35000, allowances: 5000, deductions: 1500 },
    { user: telecallerUsers[1], base: 35000, allowances: 5000, deductions: 1500 },
    { user: telecallerUsers[2], base: 32000, allowances: 4000, deductions: 1500 },
    { user: telecallerUsers[3], base: 32000, allowances: 4000, deductions: 1500 },
    { user: designerUser, base: 45000, allowances: 5000, deductions: 2000 },
    { user: smmUser, base: 42000, allowances: 5000, deductions: 2000 },
    { user: mediaBuyerUser, base: 55000, allowances: 8000, deductions: 2500 },
  ];

  for (const s of salaryData) {
    const net = s.base + s.allowances - s.deductions;
    await prisma.salaryRecord.create({
      data: {
        userId: s.user.id,
        monthlySalary: s.base,
        allowances: s.allowances,
        deductions: s.deductions,
        netSalary: net,
        payrollPeriod: "October 2026",
        paymentStatus: "PAID",
        paymentDate: new Date("2026-10-05"),
        notes: "Regular monthly payroll processed via direct bank transfer.",
      },
    });
  }

  // 5. Attendance for Today (2026-10-12) and past days
  const todayStr = "2026-10-12";
  const allStaff = [adminUser, ...telecallerUsers, designerUser, smmUser, mediaBuyerUser];
  for (let i = 0; i < allStaff.length; i++) {
    const u = allStaff[i];
    await prisma.attendance.create({
      data: {
        userId: u.id,
        date: todayStr,
        checkInTime: new Date("2026-10-12T09:58:00+05:30"),
        checkOutTime: null,
        totalHours: 4.5,
        status: i === 3 ? "WFH" : "PRESENT",
        notes: i === 3 ? "Approved WFH for personal work" : "Checked in on time",
      },
    });
  }

  // 6. Internal Meta Ads Campaigns (Arvian Agency's Own Lead-Gen Campaigns)
  const campaignScale = await prisma.campaign.create({
    data: {
      agencyId: agency.id,
      isInternal: true,
      name: "Arvian Meta Ads Lead Gen - Scale Q4",
      objective: "LEADS",
      platform: "META",
      startDate: new Date("2026-10-01"),
      status: "ACTIVE",
      dailyBudget: 2500,
      lifetimeBudget: 75000,
      actualSpend: 28400,
      targetAudience: "Business owners, D2C Founders, E-commerce, Real estate agents in India, Age 26-55",
      targetLocation: "Mumbai, Delhi NCR, Bangalore, Pune, Ahmedabad",
      adCopyHeadline: "Double Your Sales With Proven Meta Ads & ROI Tracking",
      adCopyPrimary: "Stop burning ad budget. Arvian Marketing engineers high-converting Meta Ads and landing pages for scalable business growth.",
      callToAction: "Get Free Audit",
      assignedEmployeeId: mediaBuyerUser.id,
      notes: "Primary top-of-funnel lead acquisition campaign for Arvian agency services.",
    },
  });

  const campaignRetargeting = await prisma.campaign.create({
    data: {
      agencyId: agency.id,
      isInternal: true,
      name: "Arvian High-Ticket Agency Retargeting",
      objective: "LEADS",
      platform: "META",
      startDate: new Date("2026-10-03"),
      status: "ACTIVE",
      dailyBudget: 1500,
      lifetimeBudget: 45000,
      actualSpend: 14100,
      targetAudience: "Website visitors 30d, IG profile engagers 60d, Video viewers 50%+",
      targetLocation: "India Metro Cities",
      adCopyHeadline: "Ready for 3x ROAS? Partner with Arvian Marketing",
      adCopyPrimary: "See our latest case studies in healthcare, real estate, and D2C brands. Book your 1-on-1 growth consultation today.",
      callToAction: "Book Strategy Call",
      assignedEmployeeId: mediaBuyerUser.id,
      notes: "Mid and bottom funnel retargeting campaign.",
    },
  });

  // Daily metrics for internal campaigns
  const metricDates = ["2026-10-09", "2026-10-10", "2026-10-11", "2026-10-12"];
  for (const d of metricDates) {
    await prisma.campaignDailyMetric.create({
      data: {
        campaignId: campaignScale.id,
        date: d,
        spend: 2450,
        impressions: 18400,
        reach: 14200,
        frequency: 1.3,
        linkClicks: 320,
        outboundClicks: 290,
        leads: 12,
        messagingConversations: 4,
        landingPageViews: 280,
        conversions: 12,
        revenue: 0,
      },
    });

    await prisma.campaignDailyMetric.create({
      data: {
        campaignId: campaignRetargeting.id,
        date: d,
        spend: 1480,
        impressions: 7200,
        reach: 5800,
        frequency: 1.24,
        linkClicks: 140,
        outboundClicks: 132,
        leads: 8,
        messagingConversations: 6,
        landingPageViews: 128,
        conversions: 8,
        revenue: 0,
      },
    });
  }

  // 7. Workflow B: Exactly 10 leads per employee across the 4 telecallers (Rahul, Priya, Amit, Neha)
  // Total = 40 leads generated by campaign attribution and assigned to employees
  console.log("Creating Workflow B: 40 leads (10 leads per telecaller from campaigns)...");

  const industries = ["E-commerce / D2C", "Real Estate", "Healthcare / Clinics", "EdTech / Coaching", "B2B Services", "Hospitality", "Fashion Boutique", "Interior Design"];
  const cities = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune", "Ahmedabad", "Chandigarh", "Jaipur"];
  const pipelineStatuses = [
    "NEW", "NOT_CONTACTED", "CONTACTED", "INTERESTED", "QUALIFIED", 
    "FOLLOW_UP_REQUIRED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST"
  ];

  let leadCounter = 1000;
  for (let tIndex = 0; tIndex < telecallerUsers.length; tIndex++) {
    const telecaller = telecallerUsers[tIndex];
    for (let i = 0; i < 10; i++) {
      leadCounter++;
      const assignedCampaign = i % 2 === 0 ? campaignScale : campaignRetargeting;
      const status = pipelineStatuses[i % pipelineStatuses.length];
      const ind = industries[(tIndex * 2 + i) % industries.length];
      const city = cities[(tIndex + i) % cities.length];
      const customId = `LD-${leadCounter}`;
      const phone = `+91 98${tIndex}${i}1234${tIndex}${i}`.substring(0, 15);

      const lead = await prisma.lead.create({
        data: {
          customId,
          agencyId: agency.id,
          contactName: `Client Contact ${leadCounter} (${ind.split("/")[0].trim()})`,
          phone,
          email: `contact${leadCounter}@business${leadCounter}.in`,
          companyName: `Apex ${ind.split("/")[0].trim()} Brand ${leadCounter}`,
          industry: ind,
          city,
          website: `https://business${leadCounter}.in`,
          instagramHandle: `@brand_${leadCounter}`,
          source: "META_ADS",
          priority: i % 4 === 0 ? "URGENT" : i % 3 === 0 ? "HIGH" : "MEDIUM",
          status,
          servicesInterested: JSON.stringify(["Meta Ads", "Instagram Management"]),
          budget: "₹50,000 - ₹1,00,000 / month",
          previousMarketingExp: "YES",
          previousMetaAdsExp: i % 2 === 0 ? "YES" : "NO",
          prevMetaDailyBudget: i % 2 === 0 ? 1500 : null,
          prevMetaMonthlyBudget: i % 2 === 0 ? 45000 : null,
          prevCampaignResults: i % 2 === 0 ? "Ran ads through freelancer; high CPC, low lead qualification" : "Never ran formal ads, relied on word of mouth",
          adAccountNotes: "Has existing Facebook Page and Business Manager setup.",
          customerRequirements: "Needs high-quality verified leads and creative Instagram reels to establish brand trust.",
          objections: status === "LOST" ? "Budget constraint, opted for in-house intern" : "Wants guaranteed CPL under ₹120",
          notes: `Assigned to ${telecaller.name}. High intent lead received from ${assignedCampaign.name}.`,
          assignedToId: telecaller.id,
          campaignId: assignedCampaign.id,
          createdAt: new Date("2026-10-12T08:30:00+05:30"),
          nextFollowUpDate: status === "FOLLOW_UP_REQUIRED" || status === "CONTACTED" 
            ? new Date("2026-10-12T16:00:00+05:30") // Today at 4:00 PM IST!
            : new Date("2026-10-13T11:00:00+05:30"),
        },
      });

      // Create activity record
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          userId: telecaller.id,
          type: "CALL",
          notes: `Initial phone call connected by ${telecaller.name}. Discussed marketing goals, service packages and current CAC.`,
        },
      });

      // If follow up required, create FollowUp record
      if (status === "FOLLOW_UP_REQUIRED" || status === "CONTACTED" || status === "INTERESTED") {
        await prisma.followUp.create({
          data: {
            leadId: lead.id,
            assignedToId: telecaller.id,
            scheduledAt: new Date("2026-10-12T16:00:00+05:30"), // exactly today at 4:00 PM IST
            type: "CALL",
            reminderIntervalMinutes: 15,
            status: "SCHEDULED",
            attemptNumber: 1,
            notes: "Customer requested: 'Please call me today at 4:00 PM to discuss proposal breakdown.'",
            nextAction: "Present 3-tier Meta Ads + Creative package.",
          },
        });
      }
    }
  }

  // 8. Clients (Converted from leads or onboarded)
  console.log("Creating Active Clients & Workspaces...");
  const client1 = await prisma.client.create({
    data: {
      customId: "CLI-101",
      agencyId: agency.id,
      businessName: "Dr. Batra Dental Aesthetics",
      primaryContact: "Dr. Rohit Batra",
      phone: "+91 99887 76655",
      email: "dr.rohit@batradental.com",
      address: "Andheri West, Mumbai, Maharashtra",
      website: "https://batradentalaesthetics.com",
      industry: "Healthcare / Clinics",
      instagramHandle: "@batradentalmumbai",
      instagramFollowers: 12400,
      followersRecordedDate: new Date("2026-10-01"),
      servicesPurchased: JSON.stringify(["Meta Ads", "Instagram Management"]),
      contractStartDate: new Date("2026-08-01"),
      monthlyServiceFee: 45000,
      adBudget: 60000,
      paymentTerms: "Advance Monthly (1st of month)",
      paymentStatus: "PAID",
      status: "ACTIVE",
      accountManagerId: adminUser.id,
      notes: "Targeting smile makeover and Invisalign patient leads across western suburbs Mumbai.",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      customId: "CLI-102",
      agencyId: agency.id,
      businessName: "Skyline Luxury Residences",
      primaryContact: "Vikram Singhania",
      phone: "+91 99112 23344",
      email: "vikram@skylinerealty.in",
      address: "Worli, Mumbai, Maharashtra",
      website: "https://skylinerealty.in",
      industry: "Real Estate",
      instagramHandle: "@skylineluxuryresidences",
      instagramFollowers: 8500,
      followersRecordedDate: new Date("2026-10-01"),
      servicesPurchased: JSON.stringify(["Meta Ads", "Landing Page Development"]),
      contractStartDate: new Date("2026-09-01"),
      monthlyServiceFee: 75000,
      adBudget: 150000,
      paymentTerms: "Advance Monthly",
      paymentStatus: "PAID",
      status: "ACTIVE",
      accountManagerId: adminUser.id,
      notes: "High-ticket residential 3 & 4 BHK luxury project in Worli. Strictly verified buyer leads required.",
    },
  });

  const client3 = await prisma.client.create({
    data: {
      customId: "CLI-103",
      agencyId: agency.id,
      businessName: "NutriFit Superfoods D2C",
      primaryContact: "Ananya Deshmukh",
      phone: "+91 99223 34455",
      email: "ananya@nutrifitfoods.com",
      address: "Pune, Maharashtra",
      website: "https://nutrifitfoods.com",
      industry: "E-commerce / D2C",
      instagramHandle: "@nutrifit_organics",
      instagramFollowers: 34200,
      followersRecordedDate: new Date("2026-10-05"),
      servicesPurchased: JSON.stringify(["Instagram Management", "Graphic Design"]),
      contractStartDate: new Date("2026-09-15"),
      monthlyServiceFee: 38000,
      adBudget: 0,
      paymentTerms: "Net 15",
      paymentStatus: "PAID",
      status: "ACTIVE",
      accountManagerId: adminUser.id,
      notes: "Organic brand awareness, clean aesthetic feeds, weekly recipe reels, influencer collaborations.",
    },
  });

  // 9. Client Meta Ads Workspace (Module 6)
  const clientAdCampaign = await prisma.campaign.create({
    data: {
      agencyId: agency.id,
      clientId: client1.id,
      isInternal: false,
      name: "Batra Dental - Invisalign Patient Acquisition",
      objective: "LEADS",
      platform: "META",
      startDate: new Date("2026-10-01"),
      status: "ACTIVE",
      dailyBudget: 2000,
      lifetimeBudget: 60000,
      actualSpend: 24000,
      targetAudience: "Age 22-48, Radius 10km Andheri & Bandra, Interests: Orthodontics, Cosmetic Dentistry",
      targetLocation: "Mumbai Western Suburbs",
      adCopyHeadline: "Smile Confidently With Clear Invisible Aligners",
      adCopyPrimary: "Book your 3D digital smile scan today at Dr. Batra Dental Aesthetics. Flexible EMI available.",
      callToAction: "Book Appointment",
      assignedEmployeeId: mediaBuyerUser.id,
      notes: "Client ad spend ₹60,000 tracked separately from Arvian service fee ₹45,000.",
    },
  });

  // Client Creative Assets (Module 6 Creative Workflow)
  const creativesData = [
    { title: "Before / After Smile Transformation Carousel", type: "CAROUSEL", status: "APPROVED", headline: "Real Patients, Real Confident Smiles" },
    { title: "Dr. Rohit Explaining Invisalign Benefits Reel", type: "REEL", status: "CLIENT_APPROVAL_PENDING", headline: "Why Choose Clear Aligners in 2026?" },
    { title: "Diwali Festive Smile Makeover Offer Graphic", type: "IMAGE", status: "DESIGN_IN_PROGRESS", headline: "Get 20% Off Festive Smile Packages" },
    { title: "Patient Video Testimonial - Sneha's Story", type: "VIDEO", status: "REVISION_REQUIRED", headline: "Pain-Free Root Canal Experience" },
  ];

  for (const cr of creativesData) {
    await prisma.clientCreativeAsset.create({
      data: {
        clientId: client1.id,
        campaignId: clientAdCampaign.id,
        title: cr.title,
        creativeType: cr.type,
        status: cr.status,
        headline: cr.headline,
        version: cr.status === "REVISION_REQUIRED" ? 2 : 1,
        revisionNotes: cr.status === "REVISION_REQUIRED" ? "Client requested faster intro hook and added clinic logo in top right." : null,
        assignedDesignerId: designerUser.id,
      },
    });
  }

  // 10. Social Media Content Calendar (Module 7)
  console.log("Creating Social Media Content Calendar...");
  const calendarPosts = [
    {
      client: client1,
      date: new Date("2026-10-13T11:00:00+05:30"),
      type: "REEL",
      topic: "3 Daily Habits Destroying Your Tooth Enamel",
      caption: "Are you making these 3 common dental mistakes? 🦷 Watch till the end to protect your smile! Book your consultation today via link in bio.",
      hashtags: "#DentalHealth #OralCareTips #MumbaiDentist #SmileMakeover",
      status: "APPROVED",
    },
    {
      client: client1,
      date: new Date("2026-10-15T15:00:00+05:30"),
      type: "CAROUSEL",
      topic: "Braces vs. Invisalign: The Ultimate Breakdown",
      caption: "Swipe through to see which teeth alignment treatment is right for your lifestyle! 👉 Save this post for your next clinic visit.",
      hashtags: "#InvisalignIndia #ClearAligners #DentalAesthetics",
      status: "CLIENT_APPROVAL_PENDING",
    },
    {
      client: client3,
      date: new Date("2026-10-14T10:00:00+05:30"),
      type: "REEL",
      topic: "5-Minute High-Protein Breakfast Smoothie Recipe",
      caption: "Fuel your morning with our organic almond protein blend! 🥑 Tag a gym buddy who needs this quick recipe.",
      hashtags: "#CleanEating #HighProtein #OrganicLiving #NutriFit",
      status: "SCHEDULED",
    },
    {
      client: client3,
      date: new Date("2026-10-16T18:00:00+05:30"),
      type: "POST",
      topic: "Customer Spotlight: Priya's 90-Day Wellness Journey",
      caption: "Consistency beats intensity every single time. Read how Priya transformed her energy levels with NutriFit Superfoods! 🌿",
      hashtags: "#WellnessJourney #OrganicSuperfoods #HealthyLiving",
      status: "DESIGN_IN_PROGRESS",
    },
  ];

  for (const cp of calendarPosts) {
    await prisma.contentCalendarItem.create({
      data: {
        clientId: cp.client.id,
        publishDate: cp.date,
        platform: "INSTAGRAM",
        postType: cp.type,
        topic: cp.topic,
        caption: cp.caption,
        hashtags: cp.hashtags,
        assignedDesignerId: designerUser.id,
        assignedSmmId: smmUser.id,
        status: cp.status,
      },
    });
  }

  // 11. Projects & Tasks (Module 9 & 10)
  console.log("Creating Projects and Tasks...");
  const project1 = await prisma.project.create({
    data: {
      agencyId: agency.id,
      clientId: client1.id,
      name: "Dr. Batra Dental - October Retainer & Ads Sprint",
      serviceCategory: "Meta Ads + Social Media",
      ownerId: adminUser.id,
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-31"),
      status: "IN_PROGRESS",
    },
  });

  const projectTasks = [
    {
      title: "Design 4 Diwali Festival Ad Creatives",
      desc: "Create high-converting static and carousel banners with festive theme and clear CTA button.",
      assigned: designerUser,
      due: new Date("2026-10-14T18:00:00+05:30"),
      priority: "HIGH",
      status: "IN_PROGRESS",
      pct: 50,
    },
    {
      title: "Write Copy & Hook Scripts for 6 Instagram Reels",
      desc: "Draft viral scripts targeting dental hygiene tips and common orthodontic myths.",
      assigned: smmUser,
      due: new Date("2026-10-15T15:00:00+05:30"),
      priority: "MEDIUM",
      status: "COMPLETED",
      pct: 100,
    },
    {
      title: "A/B Test Ad Set Audiences on Meta Ads Manager",
      desc: "Duplicate top performing ad set, test lookalike 2% vs broad 5km geo radius.",
      assigned: mediaBuyerUser,
      due: new Date("2026-10-13T19:00:00+05:30"),
      priority: "URGENT",
      status: "IN_PROGRESS",
      pct: 75,
    },
  ];

  for (const pt of projectTasks) {
    await prisma.task.create({
      data: {
        projectId: project1.id,
        clientId: client1.id,
        title: pt.title,
        description: pt.desc,
        assignedToId: pt.assigned.id,
        createdById: adminUser.id,
        dueDate: pt.due,
        priority: pt.priority,
        status: pt.status,
        completionPercentage: pt.pct,
        checklist: JSON.stringify([
          { id: "1", text: "Initial concept & outline", done: true },
          { id: "2", text: "First draft execution", done: pt.pct >= 50 },
          { id: "3", text: "Internal QA & review", done: pt.pct >= 75 },
          { id: "4", text: "Client sign-off", done: pt.pct === 100 },
        ]),
      },
    });
  }

  // 12. Finance & Invoicing (Module 12)
  console.log("Creating Finance, Invoices & Expenses...");
  await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-101",
      agencyId: agency.id,
      clientId: client1.id,
      servicePeriod: "October 2026",
      invoiceAmount: 45000,
      amountReceived: 45000,
      outstandingAmount: 0,
      dueDate: new Date("2026-10-05"),
      paymentDate: new Date("2026-10-02"),
      paymentMethod: "Bank Transfer (NEFT)",
      paymentStatus: "PAID",
      notes: "Retainer fee for Meta Ads + Social Media Management.",
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-102",
      agencyId: agency.id,
      clientId: client2.id,
      servicePeriod: "October 2026",
      invoiceAmount: 75000,
      amountReceived: 75000,
      outstandingAmount: 0,
      dueDate: new Date("2026-10-05"),
      paymentDate: new Date("2026-10-03"),
      paymentMethod: "RTGS",
      paymentStatus: "PAID",
      notes: "Monthly retainer for Skyline Realty Ads & Landing Page Maintenance.",
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-103",
      agencyId: agency.id,
      clientId: client3.id,
      servicePeriod: "October 2026",
      invoiceAmount: 38000,
      amountReceived: 0,
      outstandingAmount: 38000,
      dueDate: new Date("2026-10-20"),
      paymentStatus: "PENDING",
      notes: "SMM retainer invoice sent via email. Due on Oct 20.",
    },
  });

  // Agency Expenses
  const expenses = [
    { cat: "SALARIES", desc: "Staff Monthly Salaries (Oct 2026)", amt: 279000, vendor: "Direct Bank Transfer" },
    { cat: "OFFICE_COWORKING", desc: "WeWork BKC 8-Desk Office Lease", amt: 52000, vendor: "WeWork India" },
    { cat: "ADVERTISING", desc: "Arvian Marketing Lead-Gen Meta Ad Spend", amt: 42500, vendor: "Meta Platforms Ireland" },
    { cat: "SOFTWARE_SUBSCRIPTIONS", desc: "Canva Pro, Semrush, Loom, Notion Team", amt: 14500, vendor: "Various SaaS" },
    { cat: "UTILITIES", desc: "High-speed Fiber Internet & Cloud Infrastructure", amt: 6200, vendor: "Airtel / AWS" },
  ];

  for (const exp of expenses) {
    await prisma.expense.create({
      data: {
        agencyId: agency.id,
        category: exp.cat,
        description: exp.desc,
        amount: exp.amt,
        vendor: exp.vendor,
        date: new Date("2026-10-05"),
        isRecurring: true,
      },
    });
  }

  // 13. Notifications & Reminders (Module 13)
  for (const tc of telecallerUsers) {
    await prisma.notification.create({
      data: {
        agencyId: agency.id,
        userId: tc.id,
        category: "FOLLOW_UP",
        title: "Follow-up Due at 4:00 PM IST Today",
        message: "You have scheduled follow-up calls due today. Check your follow-up queue.",
        linkUrl: "/follow-ups",
      },
    });
  }

  // 14. Integrations Status Configuration (Module 16 & 22)
  const integrations = [
    { provider: "META_ADS", status: "DISCONNECTED", settings: JSON.stringify({ appId: "", apiVersion: "v19.0" }) },
    { provider: "WHATSAPP", status: "DISCONNECTED", settings: JSON.stringify({ phoneId: "", provider: "Meta Cloud API" }) },
    { provider: "EMAIL_SMTP", status: "DISCONNECTED", settings: JSON.stringify({ host: "", port: 587 }) },
    { provider: "GOOGLE_SHEETS", status: "DISCONNECTED", settings: JSON.stringify({ enabled: false }) },
  ];

  for (const it of integrations) {
    await prisma.integrationConfig.create({
      data: {
        agencyId: agency.id,
        provider: it.provider,
        status: it.status,
        settings: it.settings,
      },
    });
  }

  console.log("Database seeded successfully with all modules, Workflow B data, and Arvian agency defaults!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
