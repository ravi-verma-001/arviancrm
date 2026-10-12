import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "this_month";

  const now = new Date();
  let startDate: Date;
  let endDate: Date = new Date();

  // Date range calculation (Asia/Kolkata reference)
  if (range === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  } else if (range === "yesterday") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
  } else if (range === "7d") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === "30d") {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (range === "last_month") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  } else {
    // default: this_month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const agencyId = user.agencyId;
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // Role filtering: Sales reps only see their assigned stats if restricted, but dashboard provides agency context
  const leadFilter = user.role === "SALES_EXECUTIVE" 
    ? { agencyId, assignedToId: user.id } 
    : { agencyId };

  // 1. Leads counts
  const totalLeads = await prisma.lead.count({ where: leadFilter });
  const newLeadsToday = await prisma.lead.count({
    where: { ...leadFilter, createdAt: { gte: todayStart, lte: todayEnd } },
  });
  const leadsInRange = await prisma.lead.count({
    where: { ...leadFilter, createdAt: { gte: startDate, lte: endDate } },
  });
  const uncontactedLeads = await prisma.lead.count({
    where: { ...leadFilter, status: { in: ["NEW", "NOT_CONTACTED"] } },
  });
  const qualifiedLeads = await prisma.lead.count({
    where: { ...leadFilter, status: "QUALIFIED" },
  });
  const convertedLeads = await prisma.lead.count({
    where: { ...leadFilter, status: "WON" },
  });
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0.0";

  // 2. Follow-ups
  const followUpFilter = user.role === "SALES_EXECUTIVE" 
    ? { lead: { agencyId }, assignedToId: user.id } 
    : { lead: { agencyId } };

  const followUpsDueToday = await prisma.followUp.count({
    where: {
      ...followUpFilter,
      status: "SCHEDULED",
      scheduledAt: { gte: todayStart, lte: todayEnd },
    },
  });

  const overdueFollowUps = await prisma.followUp.count({
    where: {
      ...followUpFilter,
      status: "SCHEDULED",
      scheduledAt: { lt: now },
    },
  });

  // 3. Clients
  const activeClients = await prisma.client.count({
    where: { agencyId, status: "ACTIVE" },
  });
  const inactiveClients = await prisma.client.count({
    where: { agencyId, status: { in: ["INACTIVE", "PAUSED"] } },
  });

  // Clients by service breakdown
  const allClients = await prisma.client.findMany({
    where: { agencyId },
    select: { servicesPurchased: true, status: true },
  });

  const servicesBreakdown: Record<string, number> = {
    "Meta Ads": 0,
    "Instagram Management": 0,
    "Website Development": 0,
    "Graphic Design": 0,
    "SEO": 0,
  };

  allClients.forEach((c) => {
    try {
      const services = JSON.parse(c.servicesPurchased) as string[];
      services.forEach((s) => {
        servicesBreakdown[s] = (servicesBreakdown[s] || 0) + 1;
      });
    } catch {
      // ignore parse
    }
  });

  // 4. Advertising & Internal Campaigns
  const activeCampaigns = await prisma.campaign.count({
    where: { agencyId, status: "ACTIVE" },
  });

  const totalCampaignSpendAgg = await prisma.campaignDailyMetric.aggregate({
    where: { campaign: { agencyId } },
    _sum: { spend: true, leads: true, impressions: true, linkClicks: true },
  });

  const totalSpend = totalCampaignSpendAgg._sum.spend || 0;
  const totalCampaignLeads = totalCampaignSpendAgg._sum.leads || 0;
  const totalImpressions = totalCampaignSpendAgg._sum.impressions || 0;
  const totalClicks = totalCampaignSpendAgg._sum.linkClicks || 0;

  // 5. Finance (Protected - only SUPER_ADMIN gets actual agency numbers)
  let agencyRevenue = 0;
  let outstandingPayments = 0;
  let monthlyExpenses = 0;

  if (user.role === "SUPER_ADMIN") {
    const paidInvoices = await prisma.invoice.aggregate({
      where: { agencyId, paymentStatus: "PAID" },
      _sum: { amountReceived: true },
    });
    agencyRevenue = paidInvoices._sum.amountReceived || 0;

    const outstandingInv = await prisma.invoice.aggregate({
      where: { agencyId, paymentStatus: { in: ["PENDING", "PARTIALLY_PAID", "OVERDUE"] } },
      _sum: { outstandingAmount: true },
    });
    outstandingPayments = outstandingInv._sum.outstandingAmount || 0;

    const expensesAgg = await prisma.expense.aggregate({
      where: { agencyId },
      _sum: { amount: true },
    });
    monthlyExpenses = expensesAgg._sum.amount || 0;
  }

  // 6. Attendance Summary for Today
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const totalEmployees = await prisma.user.count({ where: { agencyId, status: "ACTIVE" } });
  const attendancesToday = await prisma.attendance.findMany({
    where: { user: { agencyId }, date: todayStr },
  });
  const presentCount = attendancesToday.filter((a) => a.status === "PRESENT").length;
  const wfhCount = attendancesToday.filter((a) => a.status === "WFH").length;
  const absentCount = totalEmployees - (presentCount + wfhCount);

  // 7. Operations: Pending tasks, overdue projects, content calendar
  const pendingTasks = await prisma.task.count({
    where: { project: { agencyId }, status: { in: ["NOT_STARTED", "IN_PROGRESS", "WAITING_REVIEW"] } },
  });
  const overdueTasks = await prisma.task.count({
    where: { project: { agencyId }, status: { notIn: ["COMPLETED", "CANCELLED"] }, dueDate: { lt: now } },
  });
  const upcomingContentDeadlines = await prisma.contentCalendarItem.count({
    where: {
      client: { agencyId },
      status: { notIn: ["PUBLISHED", "CANCELLED"] },
      publishDate: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    },
  });

  // 8. Workflow B Employee-wise Lead Breakdown
  const salesTeam = await prisma.user.findMany({
    where: { agencyId, department: { contains: "Sales" } },
    select: { id: true, name: true, employeeId: true },
  });

  const employeePerformance = await Promise.all(
    salesTeam.map(async (emp) => {
      const assignedCount = await prisma.lead.count({
        where: { agencyId, assignedToId: emp.id },
      });
      const empConverted = await prisma.lead.count({
        where: { agencyId, assignedToId: emp.id, status: "WON" },
      });
      const followUpsCount = await prisma.followUp.count({
        where: { assignedToId: emp.id, status: "COMPLETED" },
      });
      return {
        id: emp.id,
        name: emp.name,
        employeeId: emp.employeeId,
        leadsAssigned: assignedCount,
        leadsConverted: empConverted,
        conversionRate: assignedCount > 0 ? ((empConverted / assignedCount) * 100).toFixed(1) : "0.0",
        followUpsCompleted: followUpsCount,
      };
    })
  );

  return NextResponse.json({
    range,
    dateBounds: { from: startDate, to: endDate },
    leads: {
      total: totalLeads,
      today: newLeadsToday,
      inRange: leadsInRange,
      uncontacted: uncontactedLeads,
      qualified: qualifiedLeads,
      converted: convertedLeads,
      conversionRate: `${conversionRate}%`,
    },
    followUps: {
      dueToday: followUpsDueToday,
      overdue: overdueFollowUps,
    },
    clients: {
      active: activeClients,
      inactive: inactiveClients,
      servicesBreakdown,
    },
    marketing: {
      activeCampaigns,
      totalSpend,
      totalCampaignLeads,
      totalImpressions,
      totalClicks,
      overallCPL: totalCampaignLeads > 0 ? `₹${(totalSpend / totalCampaignLeads).toFixed(2)}` : "N/A",
      overallCPC: totalClicks > 0 ? `₹${(totalSpend / totalClicks).toFixed(2)}` : "N/A",
    },
    finance: {
      revenue: agencyRevenue,
      outstanding: outstandingPayments,
      expenses: monthlyExpenses,
      operatingProfit: agencyRevenue - monthlyExpenses,
      isRestricted: user.role !== "SUPER_ADMIN",
    },
    attendance: {
      totalEmployees,
      present: presentCount,
      wfh: wfhCount,
      absent: Math.max(0, absentCount),
    },
    operations: {
      pendingTasks,
      overdueTasks,
      upcomingContentDeadlines,
    },
    employeePerformance,
  });
}
