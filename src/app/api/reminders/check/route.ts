import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return handleReminderCheck();
}

export async function POST() {
  return handleReminderCheck();
}

async function handleReminderCheck() {
  const now = new Date();
  
  // Find follow-ups that are scheduled, reminder not yet sent, and are within the window
  // Lookahead: up to 30 minutes in the future, or already due/overdue
  const lookaheadTime = new Date(now.getTime() + 30 * 60 * 1000);

  const pendingReminders = await prisma.followUp.findMany({
    where: {
      status: "SCHEDULED",
      reminderSent: false,
      scheduledAt: { lte: lookaheadTime },
    },
    include: {
      lead: {
        select: {
          id: true,
          customId: true,
          contactName: true,
          phone: true,
          agencyId: true,
        },
      },
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  const generatedNotifications = [];

  for (const fu of pendingReminders) {
    const timeFormatted = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(fu.scheduledAt);

    // Create persistent Notification
    const notif = await prisma.notification.create({
      data: {
        agencyId: fu.lead.agencyId,
        userId: fu.assignedToId,
        category: "FOLLOW_UP",
        title: `Follow-up Due: ${fu.lead.contactName}`,
        message: `Scheduled ${fu.type} with ${fu.lead.contactName} (${fu.lead.phone}) at ${timeFormatted} IST.`,
        linkUrl: `/follow-ups`,
      },
    });

    // Mark reminder as sent so we never duplicate
    await prisma.followUp.update({
      where: { id: fu.id },
      data: { reminderSent: true },
    });

    generatedNotifications.push(notif);
  }

  return NextResponse.json({
    success: true,
    checkedAt: now.toISOString(),
    dueCount: pendingReminders.length,
    notificationsGenerated: generatedNotifications.length,
  });
}
