import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // STRICT PRIVACY RULE: Only SUPER_ADMIN can view salaries
  if (user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: You do not have permission to view salary and payroll records." },
      { status: 403 }
    );
  }

  const salaryRecords = await prisma.salaryRecord.findMany({
    where: {
      user: { agencyId: user.agencyId },
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          employeeId: true,
          email: true,
          department: true,
          designation: true,
        },
      },
    },
  });

  const totalPayroll = salaryRecords.reduce((acc, curr) => acc + curr.netSalary, 0);

  return NextResponse.json({
    salaryRecords,
    totalPayroll,
    count: salaryRecords.length,
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Only Agency Super Admin can configure salary records." },
      { status: 403 }
    );
  }

  try {
    const data = await req.json();

    if (!data.userId || !data.monthlySalary) {
      return NextResponse.json(
        { error: "Employee and Monthly Salary amount are required" },
        { status: 400 }
      );
    }

    const base = parseFloat(data.monthlySalary);
    const allowances = data.allowances ? parseFloat(data.allowances) : 0;
    const deductions = data.deductions ? parseFloat(data.deductions) : 0;
    const advances = data.advances ? parseFloat(data.advances) : 0;
    const netSalary = base + allowances - deductions - advances;

    const record = await prisma.salaryRecord.create({
      data: {
        userId: data.userId,
        monthlySalary: base,
        allowances,
        deductions,
        advances,
        netSalary,
        payrollPeriod: data.payrollPeriod || new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date()),
        paymentStatus: data.paymentStatus || "PENDING",
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
        notes: data.notes || null,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error: unknown) {
    console.error("Salary entry error:", error);
    return NextResponse.json({ error: "Failed to create payroll record" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await req.json();
    if (!data.id) {
      return NextResponse.json({ error: "Record ID required" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus;
    if (data.paymentDate) updateData.paymentDate = new Date(data.paymentDate);
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.monthlySalary !== undefined) {
      updateData.monthlySalary = parseFloat(data.monthlySalary);
      const allowances = data.allowances !== undefined ? parseFloat(data.allowances) : 0;
      const deductions = data.deductions !== undefined ? parseFloat(data.deductions) : 0;
      updateData.netSalary = updateData.monthlySalary + allowances - deductions;
    }

    const updated = await prisma.salaryRecord.update({
      where: { id: data.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, record: updated });
  } catch (error: unknown) {
    console.error("Update payroll error:", error);
    return NextResponse.json({ error: "Failed to update payroll record" }, { status: 500 });
  }
}
