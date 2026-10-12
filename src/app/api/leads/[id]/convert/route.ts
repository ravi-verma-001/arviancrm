import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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

  if (lead.convertedToClientId) {
    return NextResponse.json(
      { error: "Lead has already been converted to a client" },
      { status: 400 }
    );
  }

  const body = await req.json();

  // Generate next client custom ID (e.g. CLI-104)
  const lastClient = await prisma.client.findFirst({
    where: { agencyId: user.agencyId },
    orderBy: { createdAt: "desc" },
    select: { customId: true },
  });

  let nextClientNumber = 101;
  if (lastClient?.customId && lastClient.customId.startsWith("CLI-")) {
    const num = parseInt(lastClient.customId.replace("CLI-", ""), 10);
    if (!isNaN(num)) nextClientNumber = num + 1;
  }
  const customId = `CLI-${nextClientNumber}`;

  const monthlyServiceFee = body.monthlyServiceFee ? parseFloat(body.monthlyServiceFee) : 40000;
  const adBudget = body.adBudget ? parseFloat(body.adBudget) : 0;
  const servicesPurchased = body.servicesPurchased || JSON.parse(lead.servicesInterested || '["Meta Ads"]');

  // Create Client record
  const client = await prisma.client.create({
    data: {
      customId,
      agencyId: user.agencyId,
      businessName: body.businessName || lead.companyName || `${lead.contactName}'s Business`,
      primaryContact: lead.contactName,
      phone: lead.phone,
      email: lead.email,
      address: body.address || lead.city,
      website: lead.website,
      industry: lead.industry,
      fbPageUrl: lead.fbPageUrl,
      instagramHandle: lead.instagramHandle,
      servicesPurchased: JSON.stringify(servicesPurchased),
      contractStartDate: body.contractStartDate ? new Date(body.contractStartDate) : new Date(),
      monthlyServiceFee,
      adBudget,
      paymentTerms: body.paymentTerms || "Advance Monthly",
      paymentStatus: "PENDING",
      status: "ACTIVE",
      accountManagerId: body.accountManagerId || user.id,
      notes: `Converted from lead ${lead.customId}. ${lead.notes || ""}`,
    },
  });

  // Update original Lead record to WON and link client
  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      status: "WON",
      convertedToClientId: client.id,
    },
  });

  // Record Lead Activity
  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      userId: user.id,
      type: "STATUS_CHANGE",
      notes: `Lead successfully converted to Client ${client.businessName} (${client.customId}) by ${user.name}`,
    },
  });

  // Automatically create Client Onboarding Project (Module 10)
  const onboardingProject = await prisma.project.create({
    data: {
      agencyId: user.agencyId,
      clientId: client.id,
      name: `${client.businessName} - Onboarding & Campaign Setup`,
      serviceCategory: servicesPurchased.includes("Meta Ads") ? "Meta Ads" : "Social Media",
      ownerId: user.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days onboarding
      status: "IN_PROGRESS",
    },
  });

  // Create starter onboarding tasks
  const starterTasks = [
    { title: "Collect Brand Assets & Ad Account Access", priority: "URGENT", pct: 0 },
    { title: "Setup Tracking Pixel / Domain Verification", priority: "HIGH", pct: 0 },
    { title: "Draft First Creative Brief & Copy Strategy", priority: "MEDIUM", pct: 0 },
  ];

  for (const st of starterTasks) {
    await prisma.task.create({
      data: {
        projectId: onboardingProject.id,
        clientId: client.id,
        title: st.title,
        createdById: user.id,
        assignedToId: user.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        priority: st.priority,
        status: "NOT_STARTED",
        completionPercentage: st.pct,
      },
    });
  }

  // Create starter invoice
  await prisma.invoice.create({
    data: {
      invoiceNumber: `INV-2026-${nextClientNumber}`,
      agencyId: user.agencyId,
      clientId: client.id,
      servicePeriod: new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date()),
      invoiceAmount: monthlyServiceFee,
      amountReceived: 0,
      outstandingAmount: monthlyServiceFee,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      paymentStatus: "PENDING",
      notes: `First month onboarding retainer invoice for ${client.businessName}.`,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Lead successfully converted to client",
    client,
    project: onboardingProject,
  });
}
