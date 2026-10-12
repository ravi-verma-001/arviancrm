import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: {
        select: { id: true, name: true, employeeId: true, email: true },
      },
      campaign: true,
      activities: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      followUps: {
        orderBy: { scheduledAt: "desc" },
        include: {
          assignedTo: { select: { id: true, name: true } },
        },
      },
      convertedClient: {
        select: { id: true, customId: true, businessName: true },
      },
    },
  });

  if (!lead || lead.agencyId !== user.agencyId) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ lead });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
  });

  if (!lead || lead.agencyId !== user.agencyId) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const data = await req.json();

  // Track status changes for audit & activity timeline
  const statusChanged = data.status && data.status !== lead.status;
  const assignmentChanged = data.assignedToId && data.assignedToId !== lead.assignedToId;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};
  if (data.contactName !== undefined) updateData.contactName = data.contactName;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.companyName !== undefined) updateData.companyName = data.companyName;
  if (data.industry !== undefined) updateData.industry = data.industry;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.website !== undefined) updateData.website = data.website;
  if (data.instagramHandle !== undefined) updateData.instagramHandle = data.instagramHandle;
  if (data.fbPageUrl !== undefined) updateData.fbPageUrl = data.fbPageUrl;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.budget !== undefined) updateData.budget = data.budget;
  if (data.previousMarketingExp !== undefined) updateData.previousMarketingExp = data.previousMarketingExp;
  if (data.previousMetaAdsExp !== undefined) updateData.previousMetaAdsExp = data.previousMetaAdsExp;
  if (data.prevMetaDailyBudget !== undefined) updateData.prevMetaDailyBudget = data.prevMetaDailyBudget ? parseFloat(data.prevMetaDailyBudget) : null;
  if (data.prevMetaMonthlyBudget !== undefined) updateData.prevMetaMonthlyBudget = data.prevMetaMonthlyBudget ? parseFloat(data.prevMetaMonthlyBudget) : null;
  if (data.prevCampaignResults !== undefined) updateData.prevCampaignResults = data.prevCampaignResults;
  if (data.adAccountNotes !== undefined) updateData.adAccountNotes = data.adAccountNotes;
  if (data.customerRequirements !== undefined) updateData.customerRequirements = data.customerRequirements;
  if (data.objections !== undefined) updateData.objections = data.objections;
  if (data.competitorInfo !== undefined) updateData.competitorInfo = data.competitorInfo;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.lostReason !== undefined) updateData.lostReason = data.lostReason;
  if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
  if (data.campaignId !== undefined) updateData.campaignId = data.campaignId;
  if (data.servicesInterested !== undefined) {
    updateData.servicesInterested = Array.isArray(data.servicesInterested) 
      ? JSON.stringify(data.servicesInterested) 
      : data.servicesInterested;
  }

  const updatedLead = await prisma.lead.update({
    where: { id: params.id },
    data: updateData,
  });

  if (statusChanged) {
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: user.id,
        type: "STATUS_CHANGE",
        notes: `Status changed from '${lead.status}' to '${data.status}' by ${user.name}`,
      },
    });
  }

  if (assignmentChanged) {
    const assignee = await prisma.user.findUnique({
      where: { id: data.assignedToId },
      select: { name: true },
    });
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: user.id,
        type: "ASSIGNMENT",
        notes: `Lead assigned to ${assignee?.name || "unassigned"} by ${user.name}`,
      },
    });
  }

  if (data.activityNote) {
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: user.id,
        type: data.activityType || "NOTE",
        notes: data.activityNote,
      },
    });
  }

  return NextResponse.json({ success: true, lead: updatedLead });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  await prisma.lead.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true, message: "Lead deleted successfully" });
}
