import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date"); // YYYY-MM-DD
  const now = new Date();
  const dateStr = dateParam || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    user: { agencyId: user.agencyId },
    date: dateStr,
  };

  // If sales/designer role, only see their own attendance or summary
  if (user.role !== "SUPER_ADMIN") {
    where.userId = user.id;
  }

  const attendances = await prisma.attendance.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, employeeId: true, department: true },
      },
    },
  });

  // Today's status of current user
  const myTodayRecord = await prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: dateStr,
      },
    },
  });

  return NextResponse.json({
    date: dateStr,
    attendances,
    myTodayRecord,
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, status, notes } = await req.json(); // action = "check_in" | "check_out"
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    let attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: dateStr,
        },
      },
    });

    if (action === "check_in") {
      if (attendance && attendance.checkInTime) {
        return NextResponse.json({ error: "Already checked in today" }, { status: 400 });
      }

      // Check if late (e.g. after 10:15 AM IST)
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const isLate = hours > 10 || (hours === 10 && minutes > 15);

      attendance = await prisma.attendance.upsert({
        where: {
          userId_date: { userId: user.id, date: dateStr },
        },
        update: {
          checkInTime: now,
          status: status || (isLate ? "LATE" : "PRESENT"),
          notes: notes || null,
        },
        create: {
          userId: user.id,
          date: dateStr,
          checkInTime: now,
          status: status || (isLate ? "LATE" : "PRESENT"),
          notes: notes || null,
        },
      });
    } else if (action === "check_out") {
      if (!attendance || !attendance.checkInTime) {
        return NextResponse.json({ error: "Must check in first before checking out" }, { status: 400 });
      }

      const diffMs = now.getTime() - attendance.checkInTime.getTime();
      const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

      attendance = await prisma.attendance.update({
        where: {
          userId_date: { userId: user.id, date: dateStr },
        },
        data: {
          checkOutTime: now,
          totalHours,
          notes: notes ? `${attendance.notes || ""}; ${notes}` : attendance.notes,
        },
      });
    }

    return NextResponse.json({ success: true, attendance });
  } catch (error: unknown) {
    console.error("Attendance check error:", error);
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
  }
}
