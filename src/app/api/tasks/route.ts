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
  const priority = searchParams.get("priority");
  const assignedToId = searchParams.get("assignedToId");
  const projectId = searchParams.get("projectId");
  const clientId = searchParams.get("clientId");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  // Restrict by agency through project or client
  if (user.role === "GRAPHIC_DESIGNER" || user.role === "SOCIAL_MEDIA_MANAGER" || user.role === "META_ADS_MANAGER") {
    // Show user's assigned tasks
    where.assignedToId = user.id;
  } else if (assignedToId) {
    where.assignedToId = assignedToId;
  }

  if (status && status !== "ALL") where.status = status;
  if (priority && priority !== "ALL") where.priority = priority;
  if (projectId) where.projectId = projectId;
  if (clientId) where.clientId = clientId;

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { dueDate: "asc" },
    include: {
      project: { select: { id: true, name: true, serviceCategory: true } },
      assignedTo: { select: { id: true, name: true, employeeId: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.title || !data.dueDate) {
      return NextResponse.json({ error: "Title and Due Date are required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        projectId: data.projectId || null,
        clientId: data.clientId || null,
        assignedToId: data.assignedToId || user.id,
        createdById: user.id,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        dueDate: new Date(data.dueDate),
        priority: data.priority || "MEDIUM",
        status: data.status || "NOT_STARTED",
        completionPercentage: data.completionPercentage ? parseInt(data.completionPercentage, 10) : 0,
        checklist: data.checklist ? JSON.stringify(data.checklist) : "[]",
      },
    });

    // Notify assigned employee if someone else assigned it
    if (data.assignedToId && data.assignedToId !== user.id) {
      await prisma.notification.create({
        data: {
          agencyId: user.agencyId,
          userId: data.assignedToId,
          category: "TASK_ASSIGNMENT",
          title: "New Task Assigned",
          message: `${user.name} assigned task: "${task.title}" to you.`,
          linkUrl: "/projects",
        },
      });
    }

    return NextResponse.json({ success: true, task });
  } catch (error: unknown) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority) updateData.priority = data.priority;
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
    if (data.completionPercentage !== undefined) updateData.completionPercentage = parseInt(data.completionPercentage, 10);
    if (data.checklist !== undefined) {
      updateData.checklist = Array.isArray(data.checklist) ? JSON.stringify(data.checklist) : data.checklist;
    }
    if (data.approvalStatus) updateData.approvalStatus = data.approvalStatus;

    // Auto-update completion if status changed to COMPLETED
    if (data.status === "COMPLETED") {
      updateData.completionPercentage = 100;
    }

    const updated = await prisma.task.update({
      where: { id: data.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, task: updated });
  } catch (error: unknown) {
    console.error("Update task error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
