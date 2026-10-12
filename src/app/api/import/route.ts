import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhone, normalizeEmail } from "@/lib/utils";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { module, rows, mode } = await req.json(); // mode = "validate" | "commit"

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No data rows provided" }, { status: 400 });
    }

    if (module !== "leads") {
      return NextResponse.json({ error: "Only leads module bulk import is currently supported" }, { status: 400 });
    }

    const validRows: any[] = [];
    const invalidRows: any[] = [];
    const duplicateRows: any[] = [];

    // Pre-fetch existing leads for duplicate checks
    const existingLeads = await prisma.lead.findMany({
      where: { agencyId: user.agencyId },
      select: { phone: true, email: true },
    });

    const phoneSet = new Set(existingLeads.map((l) => normalizePhone(l.phone).slice(-10)));
    const emailSet = new Set(existingLeads.filter((l) => l.email).map((l) => normalizeEmail(l.email!)));

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const contactName = r.contactName || r["Contact Name"] || r.name || r["Name"];
      const phone = r.phone || r["Phone"] || r.phoneNumber || r["Phone Number"] || r.mobile;
      const email = r.email || r["Email"];
      const companyName = r.companyName || r["Company Name"] || r.company;
      const source = r.source || r["Source"] || "IMPORT";
      const services = r.services || r["Services"] || ["Meta Ads"];

      if (!contactName || !phone) {
        invalidRows.push({
          rowNumber: i + 1,
          data: r,
          reason: "Missing required contact name or phone number",
        });
        continue;
      }

      const cleanPhone = normalizePhone(String(phone));
      const cleanEmail = email ? normalizeEmail(String(email)) : "";

      const isPhoneDuplicate = phoneSet.has(cleanPhone.slice(-10));
      const isEmailDuplicate = cleanEmail ? emailSet.has(cleanEmail) : false;

      if (isPhoneDuplicate || isEmailDuplicate) {
        duplicateRows.push({
          rowNumber: i + 1,
          data: r,
          contactName,
          phone,
          email,
          reason: isPhoneDuplicate ? "Phone number already exists" : "Email already exists",
        });
        continue;
      }

      validRows.push({
        contactName: String(contactName),
        phone: String(phone),
        email: cleanEmail || null,
        companyName: companyName ? String(companyName) : null,
        source: String(source),
        servicesInterested: Array.isArray(services) ? JSON.stringify(services) : JSON.stringify([String(services)]),
        city: r.city || r["City"] || null,
        industry: r.industry || r["Industry"] || null,
        budget: r.budget || r["Budget"] || null,
        notes: r.notes || r["Notes"] || "Bulk imported via CSV/XLSX wizard",
      });
    }

    // If just preview/validate
    if (mode === "validate") {
      return NextResponse.json({
        totalRows: rows.length,
        validCount: validRows.length,
        duplicateCount: duplicateRows.length,
        invalidCount: invalidRows.length,
        duplicates: duplicateRows,
        invalid: invalidRows,
        preview: validRows.slice(0, 5),
      });
    }

    // Commit valid records
    let importedCount = 0;
    const lastLead = await prisma.lead.findFirst({
      where: { agencyId: user.agencyId },
      orderBy: { createdAt: "desc" },
      select: { customId: true },
    });

    let nextNumber = 2001;
    if (lastLead?.customId && lastLead.customId.startsWith("LD-")) {
      const num = parseInt(lastLead.customId.replace("LD-", ""), 10);
      if (!isNaN(num)) nextNumber = num + 1;
    }

    for (const v of validRows) {
      const customId = `LD-${nextNumber++}`;
      await prisma.lead.create({
        data: {
          customId,
          agencyId: user.agencyId,
          contactName: v.contactName,
          phone: v.phone,
          email: v.email,
          companyName: v.companyName,
          industry: v.industry,
          city: v.city,
          source: v.source,
          servicesInterested: v.servicesInterested,
          budget: v.budget,
          notes: v.notes,
          status: "NEW",
          priority: "MEDIUM",
        },
      });
      importedCount++;
    }

    // Log to Audit Log
    await prisma.auditLog.create({
      data: {
        agencyId: user.agencyId,
        userId: user.id,
        action: "IMPORT",
        module: "LEADS",
        details: `Imported ${importedCount} leads. Skipped ${duplicateRows.length} duplicates and ${invalidRows.length} invalid.`,
      },
    });

    return NextResponse.json({
      success: true,
      importedCount,
      skippedDuplicates: duplicateRows.length,
      invalidCount: invalidRows.length,
    });
  } catch (error: unknown) {
    console.error("Import processing error:", error);
    return NextResponse.json({ error: "Failed to process import" }, { status: 500 });
  }
}
