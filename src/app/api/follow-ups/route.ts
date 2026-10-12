import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") || "today"; // today, upcoming, overdue, completed, all
  const assignedToId = searchParams.get("assignedToId");

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    lead: {
      agencyId: user.agencyId,
    },
  };

  // Role filtering
  if (user.role === "SALES_EXECUTIVE" && !assignedToId) {
    where.assignedToId = user.id;
  } else if (assignedToId) {
    where.assignedToId = assignedToId;
  }

  if (view === "today") {
    where.status = "SCHEDULED";
    where.scheduledAt = { gte: todayStart, lte: todayEnd };
  } else if (view === "upcoming") {
    where.status = "SCHEDULED";
    where.scheduledAt = { gt: todayEnd };
  } else if (view === "overdue") {
    where.status = "SCHEDULED";
    where.scheduledAt = { lt: now };
  } else if (view === "completed") {
    where.status = "COMPLETED";
  }

  const followUps = await prisma.followUp.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
    include: {
      lead: {
        select: {
          id: true,
          customId: true,
          contactName: true,
          phone: true,
          email: true,
          companyName: true,
          status: true,
          servicesInterested: true,
          priority: true,
        },
      },
      assignedTo: {
        select: { id: true, name: true, employeeId: true },
      },
    },
  });

  return NextResponse.json({ followUps });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.leadId || !data.scheduledAt) {
      return NextResponse.json(
        { error: "Lead ID and Scheduled Date/Time are required" },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(data.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: "Invalid scheduled date/time" }, { status: 400 });
    }

    // Count existing attempts for this lead
    const previousAttempts = await prisma.followUp.count({
      where: { leadId: data.leadId },
    });
    const attemptNumber = previousAttempts + 1;

    const followUp = await prisma.followUp.create({
      data: {
        leadId: data.leadId,
        assignedToId: data.assignedToId || user.id,
        scheduledAt: scheduledDate,
        type: data.type || "CALL",
        reminderIntervalMinutes: data.reminderIntervalMinutes ? parseInt(data.reminderIntervalMinutes, 10) : 15,
        status: "SCHEDULED",
        attemptNumber,
        notes: data.notes || null,
        nextAction: data.nextAction || null,
      },
    });

    // Update lead's nextFollowUpDate
    await prisma.lead.update({
      where: { id: data.leadId },
      data: {
        nextFollowUpDate: scheduledDate,
        status: "FOLLOW_UP_REQUIRED",
      },
    });

    // Create lead activity
    await prisma.leadActivity.create({
      data: {
        leadId: data.leadId,
        userId: user.id,
        type: "NOTE",
        notes: `Follow-up #${attemptNumber} scheduled for ${new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "medium",
          timeStyle: "short",
        }).format(scheduledDate)} by ${user.name}`,
      },
    });

    return NextResponse.json({ success: true, followUp });
  } catch (error: unknown) {
    console.error("Schedule follow-up error:", error);
    return NextResponse.json({ error: "Failed to schedule follow-up" }, { status: 500 });
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
      return NextResponse.json({ error: "FollowUp ID is required" }, { status: 400 });
    }

    const followUp = await prisma.followUp.findUnique({
      where: { id: data.id },
      include: { lead: true },
    });

    if (!followUp) {
      return NextResponse.json({ error: "FollowUp not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.outcome) updateData.outcome = data.outcome;
    if (data.nextAction) updateData.nextAction = data.nextAction;
    if (data.notes) updateData.notes = data.notes;
    if (data.status === "COMPLETED") {
      updateData.completedAt = new Date();
    }
    if (data.scheduledAt) {
      updateData.scheduledAt = new Date(data.scheduledAt);
    }

    const updated = await prisma.followUp.update({
      where: { id: data.id },
      data: updateData,
    });

    // Activity log
    await prisma.leadActivity.create({
      data: {
        leadId: followUp.leadId,
        userId: user.id,
        type: followUp.type,
        notes: `Follow-up marked as ${data.status || "updated"}. Outcome: ${data.outcome || "N/A"}. Notes: ${data.notes || "None"}`,
      },
    });

    // If next follow-up is scheduled simultaneously
    if (data.scheduleNextAt) {
      const nextDate = new Date(data.scheduleNextAt);
      const nextAttempt = followUp.attemptNumber + 1;
      await prisma.followUp.create({
        data: {
          leadId: followUp.leadId,
          assignedToId: followUp.assignedToId,
          scheduledAt: nextDate,
          type: data.nextType || "CALL",
          reminderIntervalMinutes: 15,
          status: "SCHEDULED",
          attemptNumber: nextAttempt,
          notes: data.nextNotes || `Follow-up attempt #${nextAttempt}`,
        },
      });

      await prisma.lead.update({
        where: { id: followUp.leadId },
        data: { nextFollowUpDate: nextDate },
      });
    }

    return NextResponse.json({ success: true, followUp: updated });
  } catch (error: unknown) {
    console.error("Update follow-up error:", error);
    return NextResponse.json({ error: "Failed to update follow-up" }, { status: 500 });
  }
}
