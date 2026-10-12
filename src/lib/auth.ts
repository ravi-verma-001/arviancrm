import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "arvian_super_secret_jwt_key_2026_marketing_crm_secure";

export interface TokenPayload {
  userId: string;
  agencyId: string;
  role: string;
  email: string;
  name: string;
  employeeId: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(req?: NextRequest | Request) {
  let token: string | undefined;

  // 1. Check cookies
  try {
    const cookieStore = cookies();
    token = cookieStore.get("arvian_session")?.value;
  } catch {
    // If called outside Server Component context
  }

  // 2. Fallback to Authorization Header if request passed
  if (!token && req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        agencyId: true,
        employeeId: true,
        name: true,
        email: true,
        role: true,
        department: true,
        designation: true,
        phone: true,
        status: true,
        workingHours: true,
        leaveBalance: true,
      },
    });

    if (!user || user.status !== "ACTIVE") return null;
    return user;
  } catch {
    return null;
  }
}

export function isSuperAdmin(role: string): boolean {
  return role === "SUPER_ADMIN";
}

export function isSales(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "SALES_EXECUTIVE";
}

export function isDesigner(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "GRAPHIC_DESIGNER";
}

export function isSMM(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "SOCIAL_MEDIA_MANAGER";
}

export function isMediaBuyer(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "META_ADS_MANAGER";
}
