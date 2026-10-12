"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Building,
  Key,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  History,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatDateTimeIST } from "@/lib/utils";

export default function SettingsPage() {
  const [agency, setAgency] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Agency profile form
  const [name, setName] = useState("Arvian Marketing");
  const [email, setEmail] = useState("contact@arvianmarketing.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.agency) {
        setAgency(data.agency);
        setName(data.agency.name);
        setEmail(data.agency.email);
        setPhone(data.agency.phone || "+91 98765 43210");
        setTimezone(data.agency.timezone || "Asia/Kolkata");
        setCurrency(data.agency.currency || "INR");
      }
      setAuditLogs(data.auditLogs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "agency",
          name,
          email,
          phone,
          timezone,
          currency,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch {
      alert("Error saving agency settings");
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm("Reset database to standard Arvian Marketing demo dataset? This will recreate all 40 leads, clients, campaigns, and attendance records.")) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/demo-data", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert("Database demo data successfully reset and re-seeded!");
        window.location.reload();
      } else {
        alert(data.error || "Reset failed");
      }
    } catch {
      alert("Network error occurred during reset");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="text-slate-700" />
            Agency Administration & Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Company profile, external API integrations, audit logging, and demo dataset controls
          </p>
        </div>

        <button
          onClick={handleResetDemoData}
          disabled={resetting}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg shadow-xs transition disabled:opacity-50"
        >
          <RotateCcw size={14} className={resetting ? "animate-spin" : ""} />
          <span>{resetting ? "Resetting..." : "Reset Demo Dataset"}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} /> Agency settings updated successfully!
        </div>
      )}

      {/* Agency Profile Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building size={16} className="text-blue-600" />
          Agency Profile & Localization
        </h3>

        <form onSubmit={handleSaveAgency} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700">Agency Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700">Official Contact Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700">Primary Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30) [Default]</option>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* External Integrations Cards (Truthful integration status) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Key size={16} className="text-purple-600" />
            External Marketing & Communication Integrations
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Production readiness status for Meta, WhatsApp, SMTP, and Google Sheets integrations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Meta Marketing API */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Meta Marketing API</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                DISCONNECTED (MANUAL FALLBACK)
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Syncs campaign insights, impressions, CTR, and CPL. Currently running in verified manual entry mode until official Meta App ID & System User token are supplied in <code>.env</code>.
            </p>
          </div>

          {/* WhatsApp Cloud API */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">WhatsApp Business Cloud API</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                DISCONNECTED (MANUAL FALLBACK)
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Direct one-click WhatsApp action links are fully active for all telecallers. Automated WhatsApp webhook triggers await official WhatsApp Business Phone Number ID configuration.
            </p>
          </div>

          {/* Transactional Email SMTP */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">SMTP Email Delivery</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                DISCONNECTED
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              In-app notification center is fully operational. Configurable SMTP credentials (SendGrid, Postmark, AWS SES) can be added for external email reminder delivery.
            </p>
          </div>

          {/* Google Sheets API */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Google Sheets Data Exchange</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                CSV/XLSX ACTIVE
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Robust CSV and spreadsheet export/import is natively implemented with duplicate detection and column validation wizards.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <History size={16} className="text-slate-600" />
            System Administrative Audit Logs
          </h3>
          <span className="text-xs text-slate-500">{auditLogs.length} events logged</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="p-3">Timestamp (IST)</th>
              <th className="p-3">User</th>
              <th className="p-3">Action</th>
              <th className="p-3">Module</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">No administrative logs recorded yet.</td>
              </tr>
            ) : (
              auditLogs.slice(0, 15).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{formatDateTimeIST(log.createdAt)}</td>
                  <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{log.user?.name || "System"}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700">{log.module}</td>
                  <td className="p-3 text-slate-600 max-w-md truncate">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
