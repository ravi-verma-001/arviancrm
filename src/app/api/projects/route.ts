import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const status = searchParams.get("status");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    agencyId: user.agencyId,
  };

  if (clientId) where.clientId = clientId;
  if (status && status !== "ALL") where.status = status;

  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      client: {
        select: { id: true, businessName: true, customId: true },
      },
      owner: {
        select: { id: true, name: true, employeeId: true },
      },
      tasks: {
        include: {
          assignedTo: { select: { id: true, name: true, employeeId: true } },
        },
      },
    },
  });

  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        agencyId: user.agencyId,
        clientId: data.clientId || null,
        name: data.name,
        serviceCategory: data.serviceCategory || "Meta Ads",
        ownerId: data.ownerId || user.id,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || "IN_PROGRESS",
        templateType: data.templateType || null,
      },
    });

    // If template selected, auto-generate standard tasks
    if (data.templateType === "MONTHLY_SMM") {
      const defaultTasks = [
        "Monthly Content Strategy & Theme Planning",
        "Copywriting for 12 Instagram Posts & Reels",
        "Graphic & Video Production for Creatives",
        "Internal Review & Quality Check",
        "Client Approval Round 1",
        "Scheduling Approved Posts",
        "Monthly Growth & Analytics Report",
      ];
      for (let i = 0; i < defaultTasks.length; i++) {
        await prisma.task.create({
          data: {
            projectId: project.id,
            clientId: project.clientId,
            title: defaultTasks[i],
            createdById: user.id,
            assignedToId: user.id,
            dueDate: new Date(Date.now() + (i + 1) * 3 * 24 * 60 * 60 * 1000),
            priority: i < 3 ? "HIGH" : "MEDIUM",
            status: i === 0 ? "IN_PROGRESS" : "NOT_STARTED",
          },
        });
      }
    } else if (data.templateType === "META_ADS_SPRINT") {
      const defaultTasks = [
        "Competitor Ad Analysis & Angle Research",
        "Write 3 Headline & Primary Copy Variations",
        "Design 4 Feed Creatives (Static & Carousel)",
        "Setup Meta Ads Campaign & Pixel Events",
        "Launch A/B Testing Matrix",
        "Day-3 Spend & CPL Optimization Review",
      ];
      for (let i = 0; i < defaultTasks.length; i++) {
        await prisma.task.create({
          data: {
            projectId: project.id,
            clientId: project.clientId,
            title: defaultTasks[i],
            createdById: user.id,
            assignedToId: user.id,
            dueDate: new Date(Date.now() + (i + 1) * 2 * 24 * 60 * 60 * 1000),
            priority: "HIGH",
            status: i === 0 ? "IN_PROGRESS" : "NOT_STARTED",
          },
        });
      }
    }

    return NextResponse.json({ success: true, project });
  } catch (error: unknown) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
