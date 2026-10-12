import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const module = searchParams.get("module") || "leads"; // leads, clients, campaigns, invoices

  const agencyId = user.agencyId;
  let csvContent = "";
  let filename = `${module}-export-${Date.now()}.csv`;

  if (module === "leads") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { agencyId };
    if (user.role === "SALES_EXECUTIVE") {
      where.assignedToId = user.id;
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { assignedTo: { select: { name: true } } },
    });

    const headers = ["Lead ID", "Contact Name", "Phone", "Email", "Company", "City", "Source", "Status", "Priority", "Assigned To", "Created Date"];
    const rows = leads.map((l) => [
      `"${l.customId}"`,
      `"${l.contactName}"`,
      `"${l.phone}"`,
      `"${l.email || ""}"`,
      `"${l.companyName || ""}"`,
      `"${l.city || ""}"`,
      `"${l.source}"`,
      `"${l.status}"`,
      `"${l.priority}"`,
      `"${l.assignedTo?.name || "Unassigned"}"`,
      `"${l.createdAt.toISOString().split("T")[0]}"`,
    ]);

    csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  } else if (module === "clients") {
    const clients = await prisma.client.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
    });

    const headers = ["Client ID", "Business Name", "Primary Contact", "Phone", "Email", "Monthly Fee", "Ad Budget", "Status", "Payment Status"];
    const rows = clients.map((c) => [
      `"${c.customId}"`,
      `"${c.businessName}"`,
      `"${c.primaryContact}"`,
      `"${c.phone}"`,
      `"${c.email || ""}"`,
      c.monthlyServiceFee,
      c.adBudget,
      `"${c.status}"`,
      `"${c.paymentStatus}"`,
    ]);

    csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  } else if (module === "invoices") {
    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { agencyId },
      include: { client: { select: { businessName: true } } },
    });

    const headers = ["Invoice #", "Client Name", "Service Period", "Amount", "Received", "Outstanding", "Due Date", "Status"];
    const rows = invoices.map((inv) => [
      `"${inv.invoiceNumber}"`,
      `"${inv.client.businessName}"`,
      `"${inv.servicePeriod}"`,
      inv.invoiceAmount,
      inv.amountReceived,
      inv.outstandingAmount,
      `"${inv.dueDate.toISOString().split("T")[0]}"`,
      `"${inv.paymentStatus}"`,
    ]);

    csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  // Audit log export action
  try {
    await prisma.auditLog.create({
      data: {
        agencyId,
        userId: user.id,
        action: "EXPORT",
        module: module.toUpperCase(),
        details: `Exported ${module} to CSV format`,
      },
    });
  } catch {
    // non blocking
  }

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
