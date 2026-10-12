"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Target,
  CalendarDays,
  CheckSquare,
  Receipt,
  MessageSquare,
  Plus,
  ArrowLeft,
  ExternalLink,
  Instagram,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { formatINR, formatDateIST, formatDateTimeIST } from "@/lib/utils";

export default function ClientWorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"creatives" | "content" | "projects" | "invoices" | "timeline">("creatives");

  // Modal / form states
  const [isAddCreativeOpen, setIsAddCreativeOpen] = useState(false);
  const [creativeTitle, setCreativeTitle] = useState("");
  const [creativeType, setCreativeType] = useState("IMAGE");
  const [creativeHeadline, setCreativeHeadline] = useState("");
  const [creativeCopy, setCreativeCopy] = useState("");

  useEffect(() => {
    fetchClient();
  }, [params.id]);

  const fetchClient = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${params.id}`);
      const data = await res.json();
      setClient(data.client);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCreative = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/clients/${params.id}/creatives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: creativeTitle,
          creativeType,
          headline: creativeHeadline,
          copyText: creativeCopy,
          status: "BRIEF_PENDING",
        }),
      });
      if (res.ok) {
        setIsAddCreativeOpen(false);
        setCreativeTitle("");
        setCreativeHeadline("");
        setCreativeCopy("");
        fetchClient();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateCreativeStatus = async (creativeId: string, newStatus: string, revisionNotes?: string) => {
    try {
      await fetch(`/api/clients/${params.id}/creatives`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: creativeId,
          status: newStatus,
          revisionNotes,
        }),
      });
      fetchClient();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !client) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  let services: string[] = [];
  try {
    services = JSON.parse(client.servicesPurchased);
  } catch {
    services = [];
  }

  const creatives = client.creativeAssets || [];
  const creativeSummary = {
    total: creatives.length,
    approved: creatives.filter((c: any) => c.status === "APPROVED").length,
    inReview: creatives.filter((c: any) => ["INTERNAL_REVIEW", "CLIENT_APPROVAL_PENDING"].includes(c.status)).length,
    revisions: creatives.filter((c: any) => c.status === "REVISION_REQUIRED").length,
    inProgress: creatives.filter((c: any) => ["DESIGN_IN_PROGRESS", "COPY_IN_PROGRESS"].includes(c.status)).length,
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/clients"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition"
        >
          <ArrowLeft size={14} /> Back to Clients Directory
        </Link>
      </div>

      {/* Client Profile Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{client.businessName}</h1>
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {client.customId}
            </span>
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              {client.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>Primary Contact: <strong className="text-slate-800">{client.primaryContact}</strong></span>
            <span>• Phone: <strong className="text-slate-800 font-mono">{client.phone}</strong></span>
            {client.instagramHandle && (
              <span className="flex items-center gap-1 text-pink-600 font-medium">
                <Instagram size={13} /> {client.instagramHandle} ({client.instagramFollowers?.toLocaleString()} followers)
              </span>
            )}
            {client.website && (
              <a href={client.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                Website <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* Services pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {services.map((s) => (
              <span key={s} className="px-2.5 py-0.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-md border border-purple-200">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Financial Separation Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 shrink-0 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Monthly Agency Fee</span>
            <span className="text-lg font-bold text-slate-900">{formatINR(client.monthlyServiceFee)}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Arvian Retainer</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Client Ad Budget</span>
            <span className="text-lg font-bold text-purple-700">{formatINR(client.adBudget)}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Separate from agency fee</span>
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveTab("creatives")}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === "creatives" ? "border-purple-600 text-purple-700 font-bold" : "border-transparent hover:text-slate-900"
          }`}
        >
          <Target size={15} /> Meta Ads Creative Tracker ({client.creativeAssets?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("content")}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === "content" ? "border-purple-600 text-purple-700 font-bold" : "border-transparent hover:text-slate-900"
          }`}
        >
          <CalendarDays size={15} /> Instagram Content Calendar ({client.contentCalendar?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === "projects" ? "border-purple-600 text-purple-700 font-bold" : "border-transparent hover:text-slate-900"
          }`}
        >
          <CheckSquare size={15} /> Projects & Tasks ({client.projects?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("invoices")}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === "invoices" ? "border-purple-600 text-purple-700 font-bold" : "border-transparent hover:text-slate-900"
          }`}
        >
          <Receipt size={15} /> Invoices ({client.invoices?.length || 0})
        </button>
      </div>

      {/* TAB 1: META ADS CREATIVES WORKFLOW */}
      {activeTab === "creatives" && (
        <div className="space-y-5">
          {/* Creative KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[11px]">Total Creatives</span>
              <strong className="text-slate-900 text-base">{creativeSummary.total}</strong>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[11px]">In Production</span>
              <strong className="text-blue-600 text-base">{creativeSummary.inProgress}</strong>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[11px]">Pending Approval</span>
              <strong className="text-amber-600 text-base">{creativeSummary.inReview}</strong>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[11px]">Revisions Required</span>
              <strong className="text-red-600 text-base">{creativeSummary.revisions}</strong>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[11px]">Approved / Live</span>
              <strong className="text-emerald-600 text-base">{creativeSummary.approved}</strong>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Creative Production & Approval Pipeline</h3>
            <button
              onClick={() => setIsAddCreativeOpen(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition"
            >
              <Plus size={14} /> Add Creative Asset
            </button>
          </div>

          {creatives.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-xs text-slate-400">
              No creative assets recorded yet. Click &quot;Add Creative Asset&quot; to begin creative briefs.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creatives.map((cr: any) => (
                <div key={cr.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {cr.creativeType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">v{cr.version}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{cr.title}</h4>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                        cr.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : cr.status === "REVISION_REQUIRED"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : cr.status === "CLIENT_APPROVAL_PENDING"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {cr.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  {cr.headline && (
                    <div className="text-xs">
                      <span className="text-slate-400 font-semibold block text-[11px]">Headline / Hook:</span>
                      <p className="font-semibold text-slate-800">{cr.headline}</p>
                    </div>
                  )}

                  {cr.revisionNotes && (
                    <div className="p-2.5 bg-red-50 text-red-800 rounded-lg text-xs border border-red-200">
                      <strong>Client Revision Notes:</strong> {cr.revisionNotes}
                    </div>
                  )}

                  {/* Approval Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      {cr.approvedBy ? `Approved by ${cr.approvedBy}` : "Pending approval"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {cr.status !== "APPROVED" && (
                        <button
                          onClick={() => updateCreativeStatus(cr.id, "APPROVED")}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px]"
                        >
                          Approve
                        </button>
                      )}
                      {cr.status !== "REVISION_REQUIRED" && (
                        <button
                          onClick={() => {
                            const notes = prompt("Enter revision feedback requested by client:");
                            if (notes) updateCreativeStatus(cr.id, "REVISION_REQUIRED", notes);
                          }}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded text-[11px]"
                        >
                          Request Revision
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INSTAGRAM CONTENT CALENDAR */}
      {activeTab === "content" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Monthly Social Media Content Schedule</h3>
            <Link
              href="/content-calendar"
              className="text-xs font-semibold text-purple-700 hover:text-purple-900"
            >
              Open Full Agency Calendar Grid →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="p-3">Publish Date</th>
                  <th className="p-3">Post Type</th>
                  <th className="p-3">Topic & Creative Hook</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {client.contentCalendar?.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                      {formatDateIST(item.publishDate)}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                        {item.postType}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{item.topic}</p>
                      <p className="text-slate-500 text-[11px] truncate max-w-md">{item.caption}</p>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={async () => {
                          const nextStatus = item.status === "APPROVED" ? "SCHEDULED" : "APPROVED";
                          await fetch("/api/content-calendar", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: item.id, status: nextStatus }),
                          });
                          fetchClient();
                        }}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-[11px]"
                      >
                        Advance Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PROJECTS & TASKS */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Active Retainer Projects & Deliverables</h3>
          <div className="space-y-3">
            {client.projects?.map((proj: any) => (
              <div key={proj.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{proj.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                    {proj.status}
                  </span>
                </div>

                <div className="space-y-2">
                  {proj.tasks?.map((t: any) => (
                    <div key={t.id} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-800">{t.title}</p>
                        <span className="text-[10px] text-slate-400">Due: {formatDateIST(t.dueDate)} • {t.assignedTo?.name || "Unassigned"}</span>
                      </div>
                      <span className="font-bold text-slate-700">{t.completionPercentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INVOICES & BILLING */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Client Invoices & Fee History</h3>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Service Period</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {client.invoices?.map((inv: any) => (
                  <tr key={inv.id}>
                    <td className="p-3 font-mono font-bold text-slate-700">{inv.invoiceNumber}</td>
                    <td className="p-3 text-slate-800">{inv.servicePeriod}</td>
                    <td className="p-3 font-bold text-slate-900">{formatINR(inv.invoiceAmount)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{formatDateIST(inv.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD CREATIVE ASSET */}
      {isAddCreativeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">New Ad Creative Asset</h3>
            <form onSubmit={handleCreateCreative} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Creative Title *</label>
                <input
                  type="text"
                  required
                  value={creativeTitle}
                  onChange={(e) => setCreativeTitle(e.target.value)}
                  placeholder="e.g. Diwali Offer Carousel Banner"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Format</label>
                <select
                  value={creativeType}
                  onChange={(e) => setCreativeType(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="IMAGE">Static Image Ad</option>
                  <option value="CAROUSEL">Multi-Card Carousel</option>
                  <option value="REEL">Instagram Reel (9:16)</option>
                  <option value="VIDEO">Standard Video Ad (1:1)</option>
                  <option value="STORY">Instagram Story Ad</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Headline</label>
                <input
                  type="text"
                  value={creativeHeadline}
                  onChange={(e) => setCreativeHeadline(e.target.value)}
                  placeholder="e.g. 50% Off First Visit"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Primary Text / Script</label>
                <textarea
                  rows={2}
                  value={creativeCopy}
                  onChange={(e) => setCreativeCopy(e.target.value)}
                  placeholder="Draft primary copy or script hook..."
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCreativeOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg"
                >
                  Create Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
