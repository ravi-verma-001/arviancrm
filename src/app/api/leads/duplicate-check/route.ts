import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhone, normalizeEmail } from "@/lib/utils";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone, email } = await req.json();

  const cleanPhone = phone ? normalizePhone(phone) : "";
  const cleanEmail = email ? normalizeEmail(email) : "";

  if (!cleanPhone && !cleanEmail) {
    return NextResponse.json({ isDuplicate: false, duplicates: [] });
  }

  const duplicates = await prisma.lead.findMany({
    where: {
      agencyId: user.agencyId,
      OR: [
        ...(cleanPhone.length >= 7 ? [{ phone: { contains: cleanPhone.slice(-10) } }] : []),
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
      ],
    },
    select: {
      id: true,
      customId: true,
      contactName: true,
      phone: true,
      email: true,
      companyName: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    isDuplicate: duplicates.length > 0,
    duplicates,
  });
}
