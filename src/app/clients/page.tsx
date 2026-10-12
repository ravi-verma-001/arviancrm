"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Search,
  ExternalLink,
  IndianRupee,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { formatINR, formatDateIST } from "@/lib/utils";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("ALL");

  useEffect(() => {
    fetchClients();
  }, [serviceFilter]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (serviceFilter !== "ALL") params.append("service", serviceFilter);
      if (search) params.append("search", search);

      const res = await fetch(`/api/clients?${params.toString()}`);
      const data = await res.json();
      setClients(data.clients || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="text-purple-600" />
            Client Accounts & Workspaces
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage retained clients, Meta Ads setups, Instagram accounts, and dedicated creative workspaces
          </p>
        </div>

        <Link
          href="/leads"
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition"
        >
          <Plus size={16} />
          <span>Convert From Leads CRM</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full md:w-auto relative">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchClients()}
            placeholder="Search by business name, contact, phone, client ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
          />
        </div>

        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none bg-white text-slate-700"
        >
          <option value="ALL">All Services</option>
          <option value="Meta Ads">Meta Ads</option>
          <option value="Instagram">Instagram Management</option>
          <option value="Website">Website / Landing Page</option>
          <option value="Design">Graphic Design</option>
        </select>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Loading client directory...</div>
      ) : clients.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <Briefcase size={36} className="mx-auto text-slate-300 mb-2" />
          <h3 className="font-semibold text-slate-800 text-sm">No clients found</h3>
          <p className="text-xs text-slate-400 mt-1">Convert won leads from the Leads CRM to generate new client accounts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((c) => {
            let services: string[] = [];
            try {
              services = JSON.parse(c.servicesPurchased);
            } catch {
              services = [];
            }

            return (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-slate-400">{c.customId}</span>
                      <h3 className="font-bold text-slate-900 text-base mt-0.5 group-hover:text-purple-700 transition">
                        {c.businessName}
                      </h3>
                      <p className="text-xs text-slate-500">{c.primaryContact} • {c.industry || "General"}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {c.status}
                    </span>
                  </div>

                  {/* Services badges */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {services.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Financial Retainer Strip */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Monthly Agency Retainer</span>
                      <span className="font-bold text-slate-900">{formatINR(c.monthlyServiceFee)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Ad Spend Budget</span>
                      <span className="font-bold text-purple-700">{formatINR(c.adBudget)}</span>
                    </div>
                  </div>

                  {/* Workspace Deliverable Counts */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Campaigns: <strong>{c._count?.campaigns}</strong></span>
                    <span>Creatives: <strong>{c._count?.creativeAssets}</strong></span>
                    <span>Posts: <strong>{c._count?.contentCalendar}</strong></span>
                    <span>Invoices: <strong>{c._count?.invoices}</strong></span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Onboarded: {formatDateIST(c.contractStartDate)}
                  </span>
                  <Link
                    href={`/clients/${c.id}`}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                  >
                    Enter Workspace <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
