import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { agency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Account is inactive. Contact agency administrator." },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      agencyId: user.agencyId,
      role: user.role,
      email: user.email,
      name: user.name,
      employeeId: user.employeeId,
    });

    // Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          agencyId: user.agencyId,
          userId: user.id,
          action: "LOGIN",
          module: "AUTH",
          details: `User ${user.name} logged in successfully`,
        },
      });
    } catch {
      // Non-blocking audit log
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        agencyId: user.agencyId,
        agencyName: user.agency.name,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set("arvian_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    const msg = error?.message || "";
    if (msg.includes("DATABASE_URL") || msg.includes("Can't reach database") || msg.includes("P1001") || msg.includes("P1017")) {
      return NextResponse.json(
        { error: "Database connection failed. Please ensure DATABASE_URL and DIRECT_URL are configured in your hosting environment variables." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Authentication failed. " + (error?.message || "Internal server error") },
      { status: 500 }
    );
  }
}
