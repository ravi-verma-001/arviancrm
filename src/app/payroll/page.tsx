"use client";

import { useState, useEffect } from "react";
import {
  CircleDollarSign,
  ShieldCheck,
  AlertTriangle,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { formatINR, formatDateIST } from "@/lib/utils";

export default function PayrollPage() {
  const [payrollData, setPayrollData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payroll");
      if (res.status === 403) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setPayrollData(data);
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
          Employee salary and payroll records are strictly restricted to the Agency Super Admin / Owner.
          Your current account does not have authorization to view this sensitive financial data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CircleDollarSign className="text-emerald-600" />
            Executive Payroll & Salary Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin-restricted compensation schedules, allowances, deductions, and payroll verification
          </p>
        </div>

        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
          <span>Monthly Payroll Run:</span>
          <strong className="text-sm font-bold">{formatINR(payrollData?.totalPayroll)}</strong>
        </div>
      </div>

      {/* Security Privacy Notice */}
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
        <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
        <span>
          <strong>Role Guard Active:</strong> You are viewing this page as Agency Super Admin. Non-admin roles (sales telecallers, graphic designers, social media managers) are completely blocked by server-side authorization and receive a 403 Forbidden.
        </span>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="p-3">Staff ID</th>
              <th className="p-3">Employee Name</th>
              <th className="p-3">Department & Designation</th>
              <th className="p-3">Base Salary</th>
              <th className="p-3">Allowances</th>
              <th className="p-3">Deductions</th>
              <th className="p-3 font-bold text-slate-900">Net Pay</th>
              <th className="p-3">Payroll Period</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">Loading payroll data...</td>
              </tr>
            ) : (
              payrollData?.salaryRecords?.map((rec: any) => (
                <tr key={rec.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-400">{rec.user?.employeeId}</td>
                  <td className="p-3 font-bold text-slate-900">{rec.user?.name}</td>
                  <td className="p-3 text-slate-600">
                    {rec.user?.designation} <span className="text-[11px] text-slate-400">({rec.user?.department})</span>
                  </td>
                  <td className="p-3 text-slate-700">{formatINR(rec.monthlySalary)}</td>
                  <td className="p-3 text-emerald-700">+{formatINR(rec.allowances)}</td>
                  <td className="p-3 text-red-600">-{formatINR(rec.deductions)}</td>
                  <td className="p-3 font-extrabold text-slate-900 text-sm">
                    {formatINR(rec.netSalary)}
                  </td>
                  <td className="p-3 text-slate-600">{rec.payrollPeriod}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {rec.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
