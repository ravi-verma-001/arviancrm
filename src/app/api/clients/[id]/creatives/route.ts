import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const creatives = await prisma.clientCreativeAsset.findMany({
    where: { clientId: params.id },
    orderBy: { createdAt: "desc" },
  });

  // Calculate summary counts as required by Module 6
  const summary = {
    total: creatives.length,
    completed: creatives.filter((c) => c.status === "APPROVED").length,
    pending: creatives.filter((c) => ["BRIEF_PENDING", "COPY_IN_PROGRESS"].includes(c.status)).length,
    inProgress: creatives.filter((c) => c.status === "DESIGN_IN_PROGRESS").length,
    submittedForApproval: creatives.filter((c) => ["INTERNAL_REVIEW", "CLIENT_APPROVAL_PENDING"].includes(c.status)).length,
    approved: creatives.filter((c) => c.status === "APPROVED").length,
    revisions: creatives.filter((c) => c.status === "REVISION_REQUIRED").length,
  };

  return NextResponse.json({ creatives, summary });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const creative = await prisma.clientCreativeAsset.create({
      data: {
        clientId: params.id,
        campaignId: data.campaignId || null,
        title: data.title,
        creativeType: data.creativeType || "IMAGE",
        status: data.status || "BRIEF_PENDING",
        headline: data.headline || null,
        copyText: data.copyText || null,
        fileUrl: data.fileUrl || null,
        assignedDesignerId: data.assignedDesignerId || null,
        version: 1,
      },
    });

    return NextResponse.json({ success: true, creative });
  } catch (error: unknown) {
    console.error("Create creative asset error:", error);
    return NextResponse.json({ error: "Failed to create creative asset" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    if (!data.id) {
      return NextResponse.json({ error: "Creative ID is required" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.title) updateData.title = data.title;
    if (data.copyText !== undefined) updateData.copyText = data.copyText;
    if (data.headline !== undefined) updateData.headline = data.headline;
    if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl;
    if (data.revisionNotes !== undefined) {
      updateData.revisionNotes = data.revisionNotes;
      if (data.status === "REVISION_REQUIRED") {
        updateData.version = { increment: 1 };
      }
    }
    if (data.status === "APPROVED") {
      updateData.approvedBy = user.name;
      updateData.approvedAt = new Date();
    }

    const updated = await prisma.clientCreativeAsset.update({
      where: { id: data.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, creative: updated });
  } catch (error: unknown) {
    console.error("Update creative asset error:", error);
    return NextResponse.json({ error: "Failed to update creative asset" }, { status: 500 });
  }
}
