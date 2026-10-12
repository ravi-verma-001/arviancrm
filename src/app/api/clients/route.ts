import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const service = searchParams.get("service");
  const search = searchParams.get("search");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    agencyId: user.agencyId,
  };

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (service && service !== "ALL") {
    where.servicesPurchased = { contains: service };
  }

  if (search) {
    const q = search.trim();
    where.OR = [
      { businessName: { contains: q } },
      { primaryContact: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
      { customId: { contains: q } },
    ];
  }

  const clients = await prisma.client.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          projects: true,
          campaigns: true,
          creativeAssets: true,
          contentCalendar: true,
          invoices: true,
        },
      },
    },
  });

  return NextResponse.json({ clients });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.businessName || !data.primaryContact || !data.phone) {
      return NextResponse.json(
        { error: "Business name, primary contact and phone are required" },
        { status: 400 }
      );
    }

    // Generate customId like CLI-104
    const lastClient = await prisma.client.findFirst({
      where: { agencyId: user.agencyId },
      orderBy: { createdAt: "desc" },
      select: { customId: true },
    });

    let nextNumber = 101;
    if (lastClient?.customId && lastClient.customId.startsWith("CLI-")) {
      const num = parseInt(lastClient.customId.replace("CLI-", ""), 10);
      if (!isNaN(num)) nextNumber = num + 1;
    }
    const customId = `CLI-${nextNumber}`;

    const client = await prisma.client.create({
      data: {
        customId,
        agencyId: user.agencyId,
        businessName: data.businessName,
        primaryContact: data.primaryContact,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        website: data.website || null,
        industry: data.industry || null,
        fbPageUrl: data.fbPageUrl || null,
        instagramHandle: data.instagramHandle || null,
        instagramFollowers: data.instagramFollowers ? parseInt(data.instagramFollowers, 10) : 0,
        followersRecordedDate: new Date(),
        servicesPurchased: JSON.stringify(data.servicesPurchased || ["Meta Ads"]),
        contractStartDate: data.contractStartDate ? new Date(data.contractStartDate) : new Date(),
        contractEndDate: data.contractEndDate ? new Date(data.contractEndDate) : null,
        renewalDate: data.renewalDate ? new Date(data.renewalDate) : null,
        accountManagerId: data.accountManagerId || user.id,
        monthlyServiceFee: data.monthlyServiceFee ? parseFloat(data.monthlyServiceFee) : 0,
        adBudget: data.adBudget ? parseFloat(data.adBudget) : 0,
        paymentTerms: data.paymentTerms || "Advance Monthly",
        paymentStatus: data.paymentStatus || "PAID",
        status: data.status || "ACTIVE",
        notes: data.notes || null,
      },
    });

    return NextResponse.json({ success: true, client });
  } catch (error: unknown) {
    console.error("Create client error:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
