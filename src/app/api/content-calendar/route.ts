import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const month = searchParams.get("month"); // 1-12
  const year = searchParams.get("year");
  const status = searchParams.get("status");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    client: { agencyId: user.agencyId },
  };

  if (clientId) {
    where.clientId = clientId;
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (year && month) {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10) - 1;
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59);
    where.publishDate = { gte: start, lte: end };
  }

  const items = await prisma.contentCalendarItem.findMany({
    where,
    orderBy: { publishDate: "asc" },
    include: {
      client: {
        select: { id: true, businessName: true, customId: true, instagramHandle: true },
      },
    },
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.clientId || !data.topic || !data.publishDate) {
      return NextResponse.json(
        { error: "Client ID, Topic, and Publish Date are required" },
        { status: 400 }
      );
    }

    const item = await prisma.contentCalendarItem.create({
      data: {
        clientId: data.clientId,
        publishDate: new Date(data.publishDate),
        platform: data.platform || "INSTAGRAM",
        postType: data.postType || "POST",
        topic: data.topic,
        caption: data.caption || null,
        hashtags: data.hashtags || null,
        creativeUrl: data.creativeUrl || null,
        assignedDesignerId: data.assignedDesignerId || null,
        assignedSmmId: data.assignedSmmId || null,
        status: data.status || "IDEA",
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: unknown) {
    console.error("Create content item error:", error);
    return NextResponse.json({ error: "Failed to create content calendar item" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.topic) updateData.topic = data.topic;
    if (data.caption !== undefined) updateData.caption = data.caption;
    if (data.hashtags !== undefined) updateData.hashtags = data.hashtags;
    if (data.postType) updateData.postType = data.postType;
    if (data.publishDate) updateData.publishDate = new Date(data.publishDate);
    if (data.publishedUrl !== undefined) updateData.publishedUrl = data.publishedUrl;
    if (data.performanceNotes !== undefined) updateData.performanceNotes = data.performanceNotes;
    if (data.assignedDesignerId !== undefined) updateData.assignedDesignerId = data.assignedDesignerId;
    if (data.assignedSmmId !== undefined) updateData.assignedSmmId = data.assignedSmmId;

    const updated = await prisma.contentCalendarItem.update({
      where: { id: data.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: unknown) {
    console.error("Update content item error:", error);
    return NextResponse.json({ error: "Failed to update content calendar item" }, { status: 500 });
  }
}
