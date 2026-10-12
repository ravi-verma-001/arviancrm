import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhone, normalizeEmail } from "@/lib/utils";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const assignedToId = searchParams.get("assignedToId");
  const source = searchParams.get("source");
  const campaignId = searchParams.get("campaignId");
  const search = searchParams.get("search");

  // Base filter with agency isolation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    agencyId: user.agencyId,
  };

  // Role restriction: Sales reps see their own assigned leads, or all if unassigned
  if (user.role === "SALES_EXECUTIVE" && !assignedToId) {
    where.OR = [
      { assignedToId: user.id },
      { assignedToId: null },
    ];
  } else if (assignedToId) {
    where.assignedToId = assignedToId;
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (priority && priority !== "ALL") {
    where.priority = priority;
  }

  if (source && source !== "ALL") {
    where.source = source;
  }

  if (campaignId) {
    where.campaignId = campaignId;
  }

  if (search) {
    const q = search.trim();
    where.AND = [
      {
        OR: [
          { contactName: { contains: q } },
          { phone: { contains: q } },
          { email: { contains: q } },
          { companyName: { contains: q } },
          { customId: { contains: q } },
          { city: { contains: q } },
        ],
      },
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: {
        select: { id: true, name: true, employeeId: true, email: true },
      },
      campaign: {
        select: { id: true, name: true, isInternal: true },
      },
      followUps: {
        where: { status: "SCHEDULED" },
        orderBy: { scheduledAt: "asc" },
        take: 1,
      },
    },
  });

  return NextResponse.json({ leads });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.contactName || !data.phone) {
      return NextResponse.json(
        { error: "Contact Name and Phone Number are required" },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhone(data.phone);
    const cleanEmail = data.email ? normalizeEmail(data.email) : null;

    // Check for duplicate leads unless bypassFlag is explicitly true
    if (!data.allowDuplicate) {
      const existing = await prisma.lead.findFirst({
        where: {
          agencyId: user.agencyId,
          OR: [
            { phone: { contains: cleanPhone.slice(-10) } },
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ],
        },
        select: { id: true, customId: true, contactName: true, phone: true, email: true, status: true },
      });

      if (existing) {
        return NextResponse.json(
          {
            isDuplicate: true,
            message: `A potential duplicate lead already exists: ${existing.contactName} (${existing.customId}, ${existing.status})`,
            duplicateLead: existing,
          },
          { status: 409 }
        );
      }
    }

    // Generate unique custom ID like LD-1041
    const lastLead = await prisma.lead.findFirst({
      where: { agencyId: user.agencyId },
      orderBy: { createdAt: "desc" },
      select: { customId: true },
    });

    let nextNumber = 1001;
    if (lastLead?.customId && lastLead.customId.startsWith("LD-")) {
      const parsed = parseInt(lastLead.customId.replace("LD-", ""), 10);
      if (!isNaN(parsed)) nextNumber = parsed + 1;
    }
    const customId = `LD-${nextNumber}`;

    const lead = await prisma.lead.create({
      data: {
        customId,
        agencyId: user.agencyId,
        contactName: data.contactName,
        phone: data.phone,
        email: data.email || null,
        companyName: data.companyName || null,
        industry: data.industry || null,
        city: data.city || null,
        website: data.website || null,
        instagramHandle: data.instagramHandle || null,
        fbPageUrl: data.fbPageUrl || null,
        source: data.source || "MANUAL",
        priority: data.priority || "MEDIUM",
        status: data.status || "NEW",
        servicesInterested: JSON.stringify(data.servicesInterested || ["Meta Ads"]),
        budget: data.budget || null,
        previousMarketingExp: data.previousMarketingExp || "UNKNOWN",
        previousMetaAdsExp: data.previousMetaAdsExp || "UNKNOWN",
        prevMetaDailyBudget: data.prevMetaDailyBudget ? parseFloat(data.prevMetaDailyBudget) : null,
        prevMetaMonthlyBudget: data.prevMetaMonthlyBudget ? parseFloat(data.prevMetaMonthlyBudget) : null,
        prevCampaignResults: data.prevCampaignResults || null,
        adAccountNotes: data.adAccountNotes || null,
        customerRequirements: data.customerRequirements || null,
        objections: data.objections || null,
        competitorInfo: data.competitorInfo || null,
        notes: data.notes || null,
        assignedToId: data.assignedToId || (user.role === "SALES_EXECUTIVE" ? user.id : null),
        campaignId: data.campaignId || null,
        nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : null,
      },
    });

    // Record creation in lead activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: user.id,
        type: "STATUS_CHANGE",
        notes: `Lead created with status '${lead.status}' by ${user.name}`,
      },
    });

    return NextResponse.json({ success: true, lead });
  } catch (error: unknown) {
    console.error("Create lead error:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
