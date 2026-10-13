import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/employees/[id] — Edit employee details (Super Admin only)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
  }

  try {
    const data = await req.json();

    const updated = await prisma.user.update({
      where: { id: params.id, agencyId: user.agencyId },
      data: {
        name:         data.name        || undefined,
        email:        data.email       ? data.email.toLowerCase().trim() : undefined,
        phone:        data.phone       !== undefined ? data.phone : undefined,
        department:   data.department  || undefined,
        designation:  data.designation || undefined,
        role:         data.role        || undefined,
        status:       data.status      || undefined,
        workingHours: data.workingHours || undefined,
        leaveBalance: data.leaveBalance !== undefined ? parseInt(data.leaveBalance, 10) : undefined,
      },
      select: {
        id: true, employeeId: true, name: true, email: true,
        role: true, department: true, designation: true,
        phone: true, status: true, workingHours: true, leaveBalance: true,
      },
    });

    return NextResponse.json({ success: true, employee: updated });
  } catch (error) {
    console.error("Update employee error:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

// DELETE /api/employees/[id] — Remove employee (Super Admin only)
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
  }

  // Prevent admin from deleting their own account
  if (params.id === user.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  try {
    await prisma.user.delete({
      where: { id: params.id, agencyId: user.agencyId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete employee error:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
