import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q || q.length < 2) {
    return NextResponse.json({
      leads: [],
      clients: [],
      campaigns: [],
      tasks: [],
      employees: [],
      invoices: [],
    });
  }

  const agencyId = user.agencyId;

  // Search in parallel across entities with strict limits
  const [leads, clients, campaigns, tasks, employees, invoices] = await Promise.all([
    // Leads
    prisma.lead.findMany({
      where: {
        agencyId,
        OR: [
          { contactName: { contains: q } },
          { phone: { contains: q } },
          { email: { contains: q } },
          { companyName: { contains: q } },
          { customId: { contains: q } },
        ],
      },
      select: { id: true, customId: true, contactName: true, phone: true, companyName: true, status: true },
      take: 5,
    }),

    // Clients
    prisma.client.findMany({
      where: {
        agencyId,
        OR: [
          { businessName: { contains: q } },
          { primaryContact: { contains: q } },
          { customId: { contains: q } },
          { phone: { contains: q } },
        ],
      },
      select: { id: true, customId: true, businessName: true, primaryContact: true, phone: true, status: true },
      take: 5,
    }),

    // Campaigns
    prisma.campaign.findMany({
      where: {
        agencyId,
        name: { contains: q },
      },
      select: { id: true, name: true, objective: true, status: true, isInternal: true },
      take: 5,
    }),

    // Tasks
    prisma.task.findMany({
      where: {
        project: { agencyId },
        title: { contains: q },
      },
      select: { id: true, title: true, priority: true, status: true, dueDate: true },
      take: 5,
    }),

    // Employees
    prisma.user.findMany({
      where: {
        agencyId,
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { employeeId: { contains: q } },
          { department: { contains: q } },
        ],
      },
      select: { id: true, employeeId: true, name: true, role: true, department: true },
      take: 5,
    }),

    // Invoices (Only Super Admin)
    user.role === "SUPER_ADMIN"
      ? prisma.invoice.findMany({
          where: {
            agencyId,
            invoiceNumber: { contains: q },
          },
          select: { id: true, invoiceNumber: true, invoiceAmount: true, paymentStatus: true },
          take: 5,
        })
      : Promise.resolve([]),
  ]);

  return NextResponse.json({
    leads,
    clients,
    campaigns,
    tasks,
    employees,
    invoices,
  });
}
