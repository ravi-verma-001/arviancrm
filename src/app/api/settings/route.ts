import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agency = await prisma.agency.findUnique({
    where: { id: user.agencyId },
    include: {
      integrationConfigs: true,
    },
  });

  const auditLogs = user.role === "SUPER_ADMIN"
    ? await prisma.auditLog.findMany({
        where: { agencyId: user.agencyId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          user: { select: { name: true, employeeId: true } },
        },
      })
    : [];

  return NextResponse.json({
    agency,
    auditLogs,
  });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
  }

  try {
    const data = await req.json();

    if (data.type === "agency") {
      const updatedAgency = await prisma.agency.update({
        where: { id: user.agencyId },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          website: data.website,
          address: data.address,
          timezone: data.timezone || "Asia/Kolkata",
          currency: data.currency || "INR",
        },
      });
      return NextResponse.json({ success: true, agency: updatedAgency });
    }

    if (data.type === "integration") {
      // Configure an integration status safely
      const { provider, settings, status } = data;
      const updatedConfig = await prisma.integrationConfig.upsert({
        where: {
          agencyId_provider: {
            agencyId: user.agencyId,
            provider,
          },
        },
        update: {
          settings: JSON.stringify(settings || {}),
          status: status || "DISCONNECTED",
          lastChecked: new Date(),
        },
        create: {
          agencyId: user.agencyId,
          provider,
          settings: JSON.stringify(settings || {}),
          status: status || "DISCONNECTED",
          lastChecked: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          agencyId: user.agencyId,
          userId: user.id,
          action: "UPDATE",
          module: "SETTINGS",
          details: `Updated integration settings for provider ${provider}`,
        },
      });

      return NextResponse.json({ success: true, integration: updatedConfig });
    }

    return NextResponse.json({ error: "Invalid update type" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
