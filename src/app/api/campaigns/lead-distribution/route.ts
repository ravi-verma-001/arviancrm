import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date"); // YYYY-MM-DD or null

  let startOfDate: Date;
  let endOfDate: Date;

  if (dateParam) {
    const parts = dateParam.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    startOfDate = new Date(year, month, day, 0, 0, 0);
    endOfDate = new Date(year, month, day, 23, 59, 59);
  } else {
    const now = new Date();
    startOfDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    endOfDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  }

  // Fetch all campaigns for the agency
  const campaigns = await prisma.campaign.findMany({
    where: { agencyId: user.agencyId },
    select: { id: true, name: true, isInternal: true },
    orderBy: { name: "asc" },
  });

  // Fetch sales employees
  const employees = await prisma.user.findMany({
    where: { agencyId: user.agencyId, department: { contains: "Sales" } },
    select: { id: true, name: true, employeeId: true },
    orderBy: { name: "asc" },
  });

  // Fetch leads created on this date or overall
  const leads = await prisma.lead.findMany({
    where: {
      agencyId: user.agencyId,
      createdAt: { gte: startOfDate, lte: endOfDate },
    },
    select: {
      id: true,
      customId: true,
      contactName: true,
      campaignId: true,
      assignedToId: true,
      status: true,
    },
  });

  // Build the distribution matrix: Rows = Employees, Columns = Campaigns
  const campaignMap = new Map(campaigns.map((c) => [c.id, c.name]));

  const matrix = employees.map((emp) => {
    const empLeads = leads.filter((l) => l.assignedToId === emp.id);
    const byCampaign: Record<string, number> = {};

    campaigns.forEach((c) => {
      byCampaign[c.id] = 0;
    });

    empLeads.forEach((l) => {
      if (l.campaignId && byCampaign[l.campaignId] !== undefined) {
        byCampaign[l.campaignId]++;
      }
    });

    const converted = empLeads.filter((l) => l.status === "WON").length;

    return {
      employeeId: emp.id,
      employeeCustomId: emp.employeeId,
      employeeName: emp.name,
      totalLeads: empLeads.length,
      convertedLeads: converted,
      byCampaign,
    };
  });

  // Campaign-level attribution totals (independent of who it was assigned to)
  const campaignAttribution = campaigns.map((c) => {
    const campaignLeads = leads.filter((l) => l.campaignId === c.id);
    return {
      campaignId: c.id,
      campaignName: c.name,
      isInternal: c.isInternal,
      totalLeadsGenerated: campaignLeads.length,
      converted: campaignLeads.filter((l) => l.status === "WON").length,
    };
  });

  return NextResponse.json({
    selectedDate: dateParam || startOfDate.toISOString().split("T")[0],
    totalLeadsDate: leads.length,
    campaigns,
    employees,
    distributionMatrix: matrix,
    campaignAttribution,
  });
}
