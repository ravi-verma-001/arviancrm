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

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      convertedFromLead: {
        select: { id: true, customId: true, createdAt: true, source: true },
      },
      campaigns: {
        include: {
          dailyMetrics: { orderBy: { date: "desc" }, take: 7 },
        },
      },
      projects: {
        include: {
          tasks: {
            orderBy: { dueDate: "asc" },
            include: {
              assignedTo: { select: { id: true, name: true, employeeId: true } },
            },
          },
        },
      },
      creativeAssets: {
        orderBy: { createdAt: "desc" },
      },
      contentCalendar: {
        orderBy: { publishDate: "desc" },
        take: 30,
      },
      invoices: {
        orderBy: { dueDate: "desc" },
      },
      communications: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!client || client.agencyId !== user.agencyId) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({ client });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await prisma.client.findUnique({
    where: { id: params.id },
  });

  if (!client || client.agencyId !== user.agencyId) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const data = await req.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};
  if (data.businessName !== undefined) updateData.businessName = data.businessName;
  if (data.primaryContact !== undefined) updateData.primaryContact = data.primaryContact;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.website !== undefined) updateData.website = data.website;
  if (data.industry !== undefined) updateData.industry = data.industry;
  if (data.fbPageUrl !== undefined) updateData.fbPageUrl = data.fbPageUrl;
  if (data.instagramHandle !== undefined) updateData.instagramHandle = data.instagramHandle;
  if (data.instagramFollowers !== undefined) {
    updateData.instagramFollowers = parseInt(data.instagramFollowers, 10);
    updateData.followersRecordedDate = new Date();
  }
  if (data.servicesPurchased !== undefined) {
    updateData.servicesPurchased = Array.isArray(data.servicesPurchased)
      ? JSON.stringify(data.servicesPurchased)
      : data.servicesPurchased;
  }
  if (data.monthlyServiceFee !== undefined) updateData.monthlyServiceFee = parseFloat(data.monthlyServiceFee);
  if (data.adBudget !== undefined) updateData.adBudget = parseFloat(data.adBudget);
  if (data.paymentTerms !== undefined) updateData.paymentTerms = data.paymentTerms;
  if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.renewalDate !== undefined) updateData.renewalDate = data.renewalDate ? new Date(data.renewalDate) : null;

  const updatedClient = await prisma.client.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json({ success: true, client: updatedClient });
}
