import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone, normalizeEmail } from "@/lib/utils";

const WEBHOOK_API_KEY = process.env.WEBHOOK_API_KEY || "arvian_lead_webhook_key_2026";

export async function POST(req: Request) {
  try {
    // 1. Verify API Key from Header or Query Param
    const url = new URL(req.url);
    const apiKeyHeader = req.headers.get("x-api-key");
    const apiKeyParam = url.searchParams.get("api_key");
    const providedKey = apiKeyHeader || apiKeyParam;

    if (!providedKey || providedKey !== WEBHOOK_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing x-api-key" },
        { status: 401 }
      );
    }

    const data = await req.json();

    // 2. Validate essential fields
    const contactName = data.contactName || data.name || data.full_name;
    const rawPhone = data.phone || data.phone_number || data.mobile;

    if (!contactName || !rawPhone) {
      return NextResponse.json(
        { error: "Missing required fields: contactName (or name) and phone" },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhone(rawPhone);
    const cleanEmail = data.email ? normalizeEmail(data.email) : null;

    // 3. Find default agency
    const agency = await prisma.agency.findFirst();
    if (!agency) {
      return NextResponse.json({ error: "No active agency found in database" }, { status: 500 });
    }

    // 4. Duplicate Check (match trailing 10 digits of phone)
    const existing = await prisma.lead.findFirst({
      where: {
        agencyId: agency.id,
        OR: [
          { phone: { contains: cleanPhone.slice(-10) } },
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ],
      },
    });

    if (existing && !data.allowDuplicate) {
      return NextResponse.json({
        isDuplicate: true,
        message: "Duplicate lead detected. Contact already exists in CRM.",
        existingLead: {
          id: existing.id,
          customId: existing.customId,
          contactName: existing.contactName,
          status: existing.status,
        },
      });
    }

    // 5. Automatic Round-Robin Lead Assignment among active Sales Telecallers
    let assignedToId = data.assignedToId || null;
    if (!assignedToId) {
      const telecallers = await prisma.user.findMany({
        where: {
          agencyId: agency.id,
          role: "SALES_EXECUTIVE",
          status: "ACTIVE",
        },
        include: {
          _count: { select: { assignedLeads: true } },
        },
      });

      if (telecallers.length > 0) {
        telecallers.sort((a, b) => a._count.assignedLeads - b._count.assignedLeads);
        assignedToId = telecallers[0].id;
      }
    }

    // 6. Generate Custom ID (e.g. LD-1042)
    const count = await prisma.lead.count({ where: { agencyId: agency.id } });
    const customId = `LD-${1000 + count + 1}`;

    // 7. Create Lead
    const newLead = await prisma.lead.create({
      data: {
        agencyId: agency.id,
        customId,
        contactName: String(contactName).trim(),
        phone: cleanPhone,
        email: cleanEmail,
        companyName: data.companyName || data.business_name || null,
        city: data.city || null,
        source: data.source || "Meta Ads (Webhook)",
        campaignId: data.campaignId || null,
        servicesInterested: typeof data.servicesInterested === "string" 
          ? data.servicesInterested 
          : JSON.stringify(data.servicesInterested || [data.serviceInterest || "Meta Ads"]),
        priority: data.priority || "HIGH",
        status: "NEW",
        assignedToId,
        notes: data.notes || "Lead ingested automatically via external webhook.",
      },
      include: {
        assignedTo: { select: { name: true, employeeId: true } },
      },
    });

    // 8. Create In-App Notification for Assigned Salesperson
    if (assignedToId) {
      await prisma.notification.create({
        data: {
          agencyId: agency.id,
          userId: assignedToId,
          title: "New Lead Assigned (Webhook)",
          message: `Fresh lead ${newLead.contactName} (${newLead.phone}) assigned to you from ${newLead.source}.`,
          category: "LEAD",
          linkUrl: `/leads/${newLead.id}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Lead received and saved successfully",
      lead: {
        id: newLead.id,
        customId: newLead.customId,
        contactName: newLead.contactName,
        phone: newLead.phone,
        assignedTo: newLead.assignedTo ? newLead.assignedTo.name : "Unassigned",
      },
    });
  } catch (error: any) {
    console.error("Webhook lead ingest error:", error);
    return NextResponse.json({ error: error?.message || "Failed to process lead webhook" }, { status: 500 });
  }
}
