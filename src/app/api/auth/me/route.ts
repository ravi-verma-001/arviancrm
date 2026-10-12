import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agency = await prisma.agency.findUnique({
    where: { id: user.agencyId },
    select: {
      id: true,
      name: true,
      timezone: true,
      currency: true,
      email: true,
    },
  });

  return NextResponse.json({
    user: {
      ...user,
      agency,
    },
  });
}
