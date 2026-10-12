import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "internal" | "client" | null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    agencyId: user.agencyId,
  };

  if (type === "internal") {
    where.isInternal = true;
  } else if (type === "client") {
    where.isInternal = false;
  }

  const campaigns = await prisma.campaign.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      client: {
        select: { id: true, businessName: true, customId: true },
      },
      dailyMetrics: {
        orderBy: { date: "desc" },
        take: 14,
      },
      adSets: {
        include: { ads: true },
      },
      _count: {
        select: { leads: true },
      },
    },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.name) {
      return NextResponse.json({ error: "Campaign Name is required" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        agencyId: user.agencyId,
        clientId: data.clientId || null,
        isInternal: data.isInternal !== undefined ? data.isInternal : !data.clientId,
        name: data.name,
        objective: data.objective || "LEADS",
        platform: data.platform || "META",
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || "ACTIVE",
        dailyBudget: data.dailyBudget ? parseFloat(data.dailyBudget) : 0,
        lifetimeBudget: data.lifetimeBudget ? parseFloat(data.lifetimeBudget) : null,
        actualSpend: data.actualSpend ? parseFloat(data.actualSpend) : 0,
        targetAudience: data.targetAudience || null,
        targetLocation: data.targetLocation || "India",
        adCopyHeadline: data.adCopyHeadline || null,
        adCopyPrimary: data.adCopyPrimary || null,
        callToAction: data.callToAction || "Learn More",
        creativeUrl: data.creativeUrl || null,
        landingPageUrl: data.landingPageUrl || null,
        assignedEmployeeId: data.assignedEmployeeId || null,
        notes: data.notes || null,
      },
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error: unknown) {
    console.error("Create campaign error:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
