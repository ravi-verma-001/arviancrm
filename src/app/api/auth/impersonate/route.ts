import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

// POST /api/auth/impersonate
// Super Admin only — sets a session cookie for the target user so admin can view their dashboard
export async function POST(req: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { targetUserId } = await req.json();
  if (!targetUserId) {
    return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
  }

  const target = await prisma.user.findFirst({
    where: { id: targetUserId, agencyId: admin.agencyId },
    select: { id: true, agencyId: true, role: true, name: true, employeeId: true },
  });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const token = jwt.sign(
    {
      userId:     target.id,
      agencyId:   target.agencyId,
      role:       target.role,
      name:       target.name,
      employeeId: target.employeeId,
      // Store original admin id so we can restore session later
      _impersonatedBy: admin.id,
    },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

  const cookieStore = cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 2, // 2 hours
    path: "/",
  });

  return NextResponse.json({ success: true, name: target.name });
}
