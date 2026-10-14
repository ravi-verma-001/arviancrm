"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users2,
  TrendingUp,
  PhoneCall,
  Clock,
  Briefcase,
  Target,
  IndianRupee,
  Receipt,
  UserCheck,
  CheckSquare,
  ArrowUpRight,
  Filter,
  AlertTriangle,
} from "lucide-react";
import { formatINR, formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const [range, setRange] = useState("this_month");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [range]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/stats?range=${range}`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const ranges = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "This Month", value: "this_month" },
    { label: "Previous Month", value: "last_month" },
  ];

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isSuperAdmin = stats?.user?.role === "SUPER_ADMIN";
  const isSales = stats?.user?.role === "SALES_EXECUTIVE";

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isSuperAdmin
              ? "Agency Executive Dashboard"
              : isSales
              ? "Sales Executive Workspace"
              : "My Workspace Dashboard"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSuperAdmin
              ? "Real-time business performance, lead pipeline & campaign tracking"
              : isSales
              ? `Welcome back, ${stats?.user?.name || "Executive"} (${stats?.user?.employeeId}) • Your assigned leads & calling schedule`
              : `Welcome back, ${stats?.user?.name}! Real-time task & project tracking`}
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto text-xs font-medium shrink-0">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition ${
                range === r.value
                  ? "bg-white text-blue-700 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards: Sales & Leads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <Link
          href="/leads"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Leads
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
              <Users2 size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatNumber(stats?.leads?.total)}
          </p>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-slate-500">
              In selected period: <strong className="text-slate-700">{stats?.leads?.inRange}</strong>
            </span>
            <span className="text-blue-600 font-semibold">{stats?.leads?.today} today</span>
          </div>
        </Link>

        {/* Conversion Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lead Conversion
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {stats?.leads?.conversionRate}
          </p>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span>Converted: <strong className="text-slate-700">{stats?.leads?.converted} clients</strong></span>
            <span>Qualified: <strong className="text-slate-700">{stats?.leads?.qualified}</strong></span>
          </div>
        </div>

        {/* Follow-ups Due Today */}
        <Link
          href="/follow-ups?view=today"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-300 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Follow-ups Due Today
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition">
              <PhoneCall size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {stats?.followUps?.dueToday}
          </p>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-slate-500">Scheduled for today</span>
            {stats?.followUps?.overdue > 0 && (
              <span className="text-red-600 font-bold flex items-center gap-1">
                <AlertTriangle size={12} /> {stats?.followUps?.overdue} Overdue
              </span>
            )}
          </div>
        </Link>

        {/* Card 4: Active Clients for Admin, or Uncontacted Leads for Sales */}
        {!isSales ? (
          <Link
            href="/clients"
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Clients
              </span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition">
                <Briefcase size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {stats?.clients?.active}
            </p>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span>Inactive/Paused: {stats?.clients?.inactive}</span>
              <span className="text-purple-600 font-semibold">Retainers</span>
            </div>
          </Link>
        ) : (
          <Link
            href="/leads?status=NEW"
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-red-300 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Uncontacted Leads
              </span>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition">
                <PhoneCall size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {stats?.leads?.uncontacted}
            </p>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span>Awaiting first call</span>
              <span className="text-red-600 font-semibold">Priority</span>
            </div>
          </Link>
        )}
      </div>

      {/* SALES EXECUTIVE VIEW: Show only personal calling queue, pipeline & targets */}
      {isSales && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calling & Follow-up Queue */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <PhoneCall size={16} className="text-blue-600" />
                  My Daily Calling & Follow-up Action Queue
                </h3>
                <p className="text-xs text-slate-500">Priority telecalling schedule according to IST timezone</p>
              </div>
              <Link
                href="/follow-ups?view=today"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Open Full Queue <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <Link
                href="/follow-ups?view=today"
                className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 hover:border-amber-400 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">Due Today</span>
                  <Clock size={15} className="text-amber-600" />
                </div>
                <p className="text-2xl font-extrabold text-amber-700 mt-2">
                  {stats?.followUps?.dueToday}
                </p>
                <p className="text-[11px] text-amber-600 mt-1">Scheduled calls for today</p>
              </Link>

              <Link
                href="/follow-ups"
                className="p-3.5 bg-red-50/60 rounded-xl border border-red-200 hover:border-red-400 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-900">Overdue Calls</span>
                  <AlertTriangle size={15} className="text-red-600" />
                </div>
                <p className="text-2xl font-extrabold text-red-700 mt-2">
                  {stats?.followUps?.overdue}
                </p>
                <p className="text-[11px] text-red-600 mt-1">Immediate action needed</p>
              </Link>

              <Link
                href="/leads?status=NEW"
                className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 hover:border-blue-400 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">Fresh Leads</span>
                  <Users2 size={15} className="text-blue-600" />
                </div>
                <p className="text-2xl font-extrabold text-blue-700 mt-2">
                  {stats?.leads?.uncontacted}
                </p>
                <p className="text-[11px] text-blue-600 mt-1">Call within 15 minutes</p>
              </Link>
            </div>

            {/* Telecalling Protocol Guidelines */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Arvian Agency Telecalling Best Practices
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="font-semibold text-slate-800">1. Fast First Contact</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Attempt call within 15-30 mins of lead arrival.</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="font-semibold text-slate-800">2. Log Detailed Notes</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Always record outcome and next scheduled follow-up.</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="font-semibold text-slate-800">3. Multi-Touch Rule</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Minimum 3 touches before marking lead as Lost.</p>
                </div>
              </div>
            </div>
          </div>

          {/* My Performance & Targets */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Target size={16} className="text-emerald-600" />
                  My Sales Conversion Summary
                </h3>
                <p className="text-xs text-slate-500">Your performance metrics in selected date range</p>
              </div>

              <div className="space-y-3.5 mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">My Assigned Leads</span>
                  <span className="font-bold text-slate-900 text-sm">{stats?.leads?.total}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Qualified Prospects</span>
                  <span className="font-bold text-blue-600 text-sm">{stats?.leads?.qualified}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Converted Clients (Won)</span>
                  <span className="font-bold text-emerald-600 text-sm">{stats?.leads?.converted}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">My Conversion Rate</span>
                  <span className="text-sm text-emerald-600">{stats?.leads?.conversionRate}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href="/leads"
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Users2 size={14} /> Open My Lead Pipeline
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SUPER ADMIN VIEW: Agency Marketing, Agency Finance & Full Team Performance */}
      {isSuperAdmin && (
        <>
          {/* Row 2: Advertising & Finance (Strictly segregated) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Internal Meta Ads Campaign Tracker */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Target size={16} className="text-blue-600" />
                    Internal Meta Ads Lead Generation
                  </h3>
                  <p className="text-xs text-slate-500">Arvian Marketing&apos;s own customer acquisition campaigns</p>
                </div>
                <Link
                  href="/campaigns"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View Campaigns <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500">Total Ad Spend</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {formatINR(stats?.marketing?.totalSpend)}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500">Campaign Leads</span>
                  <p className="text-lg font-bold text-blue-600 mt-0.5">
                    {formatNumber(stats?.marketing?.totalCampaignLeads)}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500">Average CPL</span>
                  <p className="text-lg font-bold text-emerald-600 mt-0.5">
                    {stats?.marketing?.overallCPL}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500">Average CPC</span>
                  <p className="text-lg font-bold text-slate-700 mt-0.5">
                    {stats?.marketing?.overallCPC}
                  </p>
                </div>
              </div>

              {/* Service Distribution of Clients */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                  Client Retention by Service Type
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {stats?.clients?.servicesBreakdown &&
                    Object.entries(stats.clients.servicesBreakdown).map(([serv, count]: [string, any]) => (
                      <div key={serv} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                        <span className="text-slate-600 truncate">{serv}</span>
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-xs border border-slate-200">
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Agency Financial Health (Super Admin Only) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <IndianRupee size={16} className="text-emerald-600" />
                    Agency Finance
                  </h3>
                  <Link
                    href="/finance"
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                  >
                    Manage <ArrowUpRight size={14} />
                  </Link>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Collected Revenue</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {formatINR(stats?.finance?.revenue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Outstanding Invoices</span>
                    <span className="font-bold text-amber-600 text-sm">
                      {formatINR(stats?.finance?.outstanding)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Monthly Expenses</span>
                    <span className="font-bold text-red-600 text-sm">
                      {formatINR(stats?.finance?.expenses)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">Net Operating Profit</span>
                    <span
                      className={`text-sm ${
                        stats?.finance?.operatingProfit >= 0 ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {formatINR(stats?.finance?.operatingProfit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Attendance Widget */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                  <span className="flex items-center gap-1">
                    <UserCheck size={14} className="text-blue-600" /> Staff Attendance (Today)
                  </span>
                  <span className="text-slate-400">{stats?.attendance?.totalEmployees} total staff</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md font-medium">
                    {stats?.attendance?.present} Present
                  </span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                    {stats?.attendance?.wfh} WFH
                  </span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
                    {stats?.attendance?.absent} Absent
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Workflow B Employee Lead Performance Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users2 size={16} className="text-blue-600" />
                  Sales Team Lead Performance (Workflow B Verification)
                </h3>
                <p className="text-xs text-slate-500">
                  Tracking lead attribution, telecaller conversions, and completed follow-ups
                </p>
              </div>
              <Link
                href="/campaigns"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                View Lead Distribution Matrix →
              </Link>
            </div>

            <div className="mt-4 overflow-x-auto -mx-5 px-5">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-2.5 px-3 font-semibold">Employee ID</th>
                    <th className="py-2.5 px-3 font-semibold">Sales Executive</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Assigned Leads</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Follow-ups Completed</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Converted Clients</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.employeePerformance?.map((emp: any) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-mono font-medium text-slate-500">{emp.employeeId}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{emp.name}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {emp.leadsAssigned}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600">{emp.followUpsCompleted}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {emp.leadsConverted}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-800">{emp.conversionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
