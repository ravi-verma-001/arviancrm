import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const department = searchParams.get("department");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    agencyId: user.agencyId,
  };

  if (department && department !== "ALL") {
    where.department = { contains: department };
  }

  // NOTE: STRICT PRIVACY RULE:
  // Never include salary records or compensation in general employee endpoints!
  const employees = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      department: true,
      designation: true,
      phone: true,
      status: true,
      dateOfJoining: true,
      workingHours: true,
      leaveBalance: true,
      _count: {
        select: {
          assignedLeads: true,
          assignedTasks: true,
          followUps: true,
        },
      },
    },
  });

  return NextResponse.json({ employees });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
  }

  try {
    const data = await req.json();

    if (!data.name || !data.email || !data.employeeId) {
      return NextResponse.json(
        { error: "Employee Name, Email, and Employee ID are required" },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password || "password123", salt);

    const newEmp = await prisma.user.create({
      data: {
        agencyId: user.agencyId,
        employeeId: data.employeeId,
        name: data.name,
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: data.role || "SALES_EXECUTIVE",
        department: data.department || "Sales / Telecalling",
        designation: data.designation || "Executive",
        phone: data.phone || null,
        workingHours: data.workingHours || "10:00 AM - 07:00 PM IST",
        leaveBalance: data.leaveBalance ? parseInt(data.leaveBalance, 10) : 18,
      },
    });

    // If initial salary specified and creator is admin, create separate salary record
    if (data.monthlySalary) {
      const base = parseFloat(data.monthlySalary);
      const allowances = data.allowances ? parseFloat(data.allowances) : 0;
      const deductions = data.deductions ? parseFloat(data.deductions) : 0;
      await prisma.salaryRecord.create({
        data: {
          userId: newEmp.id,
          monthlySalary: base,
          allowances,
          deductions,
          netSalary: base + allowances - deductions,
          payrollPeriod: new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date()),
          paymentStatus: "PENDING",
        },
      });
    }

    return NextResponse.json({
      success: true,
      employee: {
        id: newEmp.id,
        employeeId: newEmp.employeeId,
        name: newEmp.name,
        email: newEmp.email,
        role: newEmp.role,
        department: newEmp.department,
        designation: newEmp.designation,
      },
    });
  } catch (error: unknown) {
    console.error("Create employee error:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
