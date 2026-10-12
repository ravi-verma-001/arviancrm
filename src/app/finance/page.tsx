"use client";

import { useState, useEffect } from "react";
import {
  Receipt,
  Plus,
  IndianRupee,
  TrendingUp,
  CreditCard,
  Building,
  Lock,
} from "lucide-react";
import { formatINR, formatDateIST } from "@/lib/utils";

export default function FinancePage() {
  const [financeData, setFinanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    fetchFinance();
  }, []);

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance");
      if (res.status === 403) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setFinanceData(data);
    } catch {
      setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  };

  if (accessDenied) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-12 text-center max-w-xl mx-auto mt-12 space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-bold text-red-900">403 — Unauthorized Access</h2>
        <p className="text-xs text-red-700 leading-relaxed">
          Agency financial records and cashflow metrics are restricted to the Agency Super Admin role.
        </p>
      </div>
    );
  }

  const summary = financeData?.summary || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="text-emerald-600" />
            Agency Financial Management & Cashflow
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Client retainer invoicing, collected cash vs unpaid receivables, agency operating expenses & profit
          </p>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block text-xs font-semibold uppercase">Total Invoiced</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatINR(summary.totalInvoiced)}</p>
          <span className="text-slate-500 text-xs mt-1 block">Billed retainer contracts</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block text-xs font-semibold uppercase">Collected Cash</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatINR(summary.totalCollectedCash)}</p>
          <span className="text-slate-500 text-xs mt-1 block">Realized bank receipts</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block text-xs font-semibold uppercase">Outstanding Invoices</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{formatINR(summary.totalOutstanding)}</p>
          <span className="text-slate-500 text-xs mt-1 block">Pending client dues</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block text-xs font-semibold uppercase">Agency Expenses</span>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatINR(summary.totalExpenses)}</p>
          <span className="text-slate-500 text-xs mt-1 block">Salaries, office & software</span>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Client Invoices</h3>
          <span className="text-xs text-slate-500">{financeData?.invoices?.length || 0} records</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="p-3">Invoice Number</th>
              <th className="p-3">Client Business</th>
              <th className="p-3">Service Period</th>
              <th className="p-3">Total Amount</th>
              <th className="p-3">Received</th>
              <th className="p-3">Outstanding</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {financeData?.invoices?.map((inv: any) => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="p-3 font-mono font-bold text-slate-800">{inv.invoiceNumber}</td>
                <td className="p-3 font-bold text-slate-900">{inv.client?.businessName}</td>
                <td className="p-3 text-slate-600">{inv.servicePeriod}</td>
                <td className="p-3 font-bold text-slate-900">{formatINR(inv.invoiceAmount)}</td>
                <td className="p-3 text-emerald-700">{formatINR(inv.amountReceived)}</td>
                <td className="p-3 text-amber-600">{formatINR(inv.outstandingAmount)}</td>
                <td className="p-3 text-slate-500">{formatDateIST(inv.dueDate)}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    inv.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {inv.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Agency Expenses Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Agency Operating Expenses</h3>
          <span className="text-xs text-slate-500">{financeData?.expenses?.length || 0} recorded items</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="p-3">Category</th>
              <th className="p-3">Description</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Vendor</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {financeData?.expenses?.map((exp: any) => (
              <tr key={exp.id} className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-slate-800">{exp.category.replace(/_/g, " ")}</td>
                <td className="p-3 text-slate-700">{exp.description}</td>
                <td className="p-3 font-bold text-red-600">{formatINR(exp.amount)}</td>
                <td className="p-3 text-slate-500">{exp.vendor || "—"}</td>
                <td className="p-3 text-slate-500">{formatDateIST(exp.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
