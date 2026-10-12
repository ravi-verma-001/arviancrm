import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Strict role check for agency finance
  if (user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Only Agency Super Admins can access finance records." },
      { status: 403 }
    );
  }

  const invoices = await prisma.invoice.findMany({
    where: { agencyId: user.agencyId },
    orderBy: { dueDate: "desc" },
    include: {
      client: { select: { id: true, businessName: true, customId: true } },
    },
  });

  const expenses = await prisma.expense.findMany({
    where: { agencyId: user.agencyId },
    orderBy: { date: "desc" },
  });

  // Calculate distinct financial totals
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.invoiceAmount, 0);
  const totalCollectedCash = invoices.reduce((sum, inv) => sum + inv.amountReceived, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const estimatedOperatingProfit = totalCollectedCash - totalExpenses;

  // Breakdown expenses by category
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
  });

  return NextResponse.json({
    summary: {
      totalInvoiced,
      totalCollectedCash,
      totalOutstanding,
      totalExpenses,
      estimatedOperatingProfit,
    },
    expensesByCategory,
    invoices,
    expenses,
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await req.json();

    if (data.type === "invoice") {
      const invAmount = parseFloat(data.invoiceAmount);
      const received = data.amountReceived ? parseFloat(data.amountReceived) : 0;
      const outstanding = Math.max(0, invAmount - received);

      const invoice = await prisma.invoice.create({
        data: {
          agencyId: user.agencyId,
          clientId: data.clientId,
          invoiceNumber: data.invoiceNumber || `INV-2026-${Date.now().toString().slice(-4)}`,
          servicePeriod: data.servicePeriod || "October 2026",
          invoiceAmount: invAmount,
          amountReceived: received,
          outstandingAmount: outstanding,
          dueDate: new Date(data.dueDate),
          paymentDate: received > 0 ? new Date() : null,
          paymentMethod: data.paymentMethod || null,
          paymentStatus: outstanding === 0 ? "PAID" : received > 0 ? "PARTIALLY_PAID" : "PENDING",
          notes: data.notes || null,
        },
      });

      return NextResponse.json({ success: true, invoice });
    } else if (data.type === "expense") {
      const expense = await prisma.expense.create({
        data: {
          agencyId: user.agencyId,
          category: data.category || "MISC",
          description: data.description,
          amount: parseFloat(data.amount),
          date: data.date ? new Date(data.date) : new Date(),
          vendor: data.vendor || null,
          isRecurring: !!data.isRecurring,
        },
      });

      return NextResponse.json({ success: true, expense });
    }

    return NextResponse.json({ error: "Invalid type. Must be 'invoice' or 'expense'" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Create finance record error:", error);
    return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 });
  }
}
