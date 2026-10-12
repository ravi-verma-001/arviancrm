"use client";

import { useState, useEffect } from "react";
import {
  Users2,
  Plus,
  Search,
  Filter,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  MoreVertical,
  ExternalLink,
  Kanban,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";
import { formatDateTimeIST, formatDateIST } from "@/lib/utils";
import { LeadModal } from "@/components/LeadModal";
import { ConvertLeadModal } from "@/components/ConvertLeadModal";
import { FollowUpModal } from "@/components/FollowUpModal";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "kanban" | "cards">("table");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<any>(null);
  const [selectedLeadForConvert, setSelectedLeadForConvert] = useState<any>(null);
  const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState<any>(null);

  const [employees, setEmployees] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    fetchLeads();
    fetchMetadata();
  }, [statusFilter, priorityFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (priorityFilter !== "ALL") params.append("priority", priorityFilter);
      if (search) params.append("search", search);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [empRes, campRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/campaigns?type=internal"),
      ]);
      const empData = await empRes.json();
      const campData = await campRes.json();
      setEmployees(empData.employees || []);
      setCampaigns(campData.campaigns || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const openWhatsApp = (phone: string, name: string) => {
    const clean = phone.replace(/\D/g, "");
    const msg = encodeURIComponent(`Hi ${name}, this is Arvian Marketing following up regarding your digital marketing inquiry.`);
    window.open(`https://wa.me/${clean}?text=${msg}`, "_blank");
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      NEW: "bg-blue-100 text-blue-800 border-blue-200",
      NOT_CONTACTED: "bg-slate-100 text-slate-700 border-slate-200",
      CONTACTED: "bg-indigo-100 text-indigo-800 border-indigo-200",
      INTERESTED: "bg-cyan-100 text-cyan-800 border-cyan-200",
      QUALIFIED: "bg-emerald-100 text-emerald-800 border-emerald-200",
      FOLLOW_UP_REQUIRED: "bg-amber-100 text-amber-800 border-amber-200",
      PROPOSAL_SENT: "bg-purple-100 text-purple-800 border-purple-200",
      NEGOTIATION: "bg-orange-100 text-orange-800 border-orange-200",
      WON: "bg-green-100 text-green-800 border-green-200",
      LOST: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border ${map[status] || "bg-slate-100 text-slate-700"}`}>
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">URGENT 🔥</span>;
      case "HIGH":
        return <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">HIGH</span>;
      case "LOW":
        return <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">LOW</span>;
      default:
        return <span className="text-[10px] bg-blue-50 text-blue-700 font-medium px-1.5 py-0.5 rounded">MEDIUM</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users2 className="text-blue-600" />
            Lead Management CRM
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture, qualify, follow up, and convert prospects into retained clients
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/export?module=leads"
            download
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Plus size={16} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:w-auto relative">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by contact, phone, email, company, ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none bg-white text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New Lead</option>
            <option value="CONTACTED">Contacted</option>
            <option value="INTERESTED">Interested</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="FOLLOW_UP_REQUIRED">Follow-up Required</option>
            <option value="PROPOSAL_SENT">Proposal Sent</option>
            <option value="WON">Won / Converted</option>
            <option value="LOST">Lost</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none bg-white text-slate-700"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* View Toggles */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md ${viewMode === "table" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="Table view"
            >
              <TableIcon size={15} />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-md ${viewMode === "kanban" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="Kanban pipeline view"
            >
              <Kanban size={15} />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-md ${viewMode === "cards" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="Card grid view"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Views */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Loading leads...</div>
      ) : leads.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <Users2 size={36} className="mx-auto text-slate-300 mb-2" />
          <h3 className="font-semibold text-slate-800 text-sm">No leads found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or create a new lead.</p>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="py-3 px-3.5 font-semibold">Lead ID</th>
                  <th className="py-3 px-3.5 font-semibold">Contact / Business</th>
                  <th className="py-3 px-3.5 font-semibold">Phone & WhatsApp</th>
                  <th className="py-3 px-3.5 font-semibold">Source</th>
                  <th className="py-3 px-3.5 font-semibold">Status</th>
                  <th className="py-3 px-3.5 font-semibold">Next Follow-up</th>
                  <th className="py-3 px-3.5 font-semibold">Assigned To</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3.5 font-mono font-medium text-slate-500 whitespace-nowrap">
                      {lead.customId}
                      <div className="mt-0.5">{getPriorityBadge(lead.priority)}</div>
                    </td>

                    <td className="py-3 px-3.5">
                      <button
                        onClick={() => setSelectedLeadForDetail(lead)}
                        className="font-bold text-slate-900 hover:text-blue-600 text-left block"
                      >
                        {lead.contactName}
                      </button>
                      <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                        {lead.companyName || lead.industry || "No company recorded"}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-mono text-slate-700">{lead.phone}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Phone size={11} /> Call
                        </a>
                        <button
                          onClick={() => openWhatsApp(lead.phone, lead.contactName)}
                          className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 font-medium"
                        >
                          <MessageSquare size={11} /> WhatsApp
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="text-slate-600 font-medium">{lead.source}</span>
                      {lead.campaign?.name && (
                        <span className="block text-[10px] text-blue-600 truncate max-w-[140px]">
                          {lead.campaign.name}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getStatusBadge(lead.status)}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                      {lead.nextFollowUpDate ? (
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock size={12} className="text-amber-600" />
                          <span>{formatDateTimeIST(lead.nextFollowUpDate)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">None scheduled</span>
                      )}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {lead.assignedTo ? (
                        <span className="font-medium text-slate-800">{lead.assignedTo.name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => setSelectedLeadForFollowUp(lead)}
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded font-semibold text-[11px] transition"
                        title="Schedule Follow-up Call"
                      >
                        Follow-up
                      </button>

                      {lead.status !== "WON" && (
                        <button
                          onClick={() => setSelectedLeadForConvert(lead)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-semibold text-[11px] transition"
                          title="Convert to Client"
                        >
                          Convert
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedLeadForDetail(lead)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] transition"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === "kanban" ? (
        /* KANBAN PIPELINE VIEW */
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
          {["NEW", "CONTACTED", "INTERESTED", "QUALIFIED", "FOLLOW_UP_REQUIRED", "WON"].map((colStatus) => {
            const colLeads = leads.filter((l) => l.status === colStatus);
            return (
              <div key={colStatus} className="bg-slate-100/70 p-3 rounded-xl border border-slate-200 flex flex-col kanban-col min-w-[220px]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 font-bold text-xs text-slate-800">
                  <span>{colStatus.replace(/_/g, " ")}</span>
                  <span className="bg-white px-2 py-0.5 rounded-full text-[10px] text-slate-600 border border-slate-200">
                    {colLeads.length}
                  </span>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto">
                  {colLeads.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => setSelectedLeadForDetail(l)}
                      className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs hover:border-blue-400 cursor-pointer transition text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-400">{l.customId}</span>
                        {getPriorityBadge(l.priority)}
                      </div>
                      <p className="font-bold text-slate-900 leading-snug">{l.contactName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{l.companyName || l.industry || l.phone}</p>
                      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{l.assignedTo?.name?.split(" ")[0] || "Unassigned"}</span>
                        <span>{l.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((l) => (
            <div key={l.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-400 font-semibold">{l.customId}</span>
                  {getPriorityBadge(l.priority)}
                </div>
                <h3 className="font-bold text-slate-900 mt-1 text-sm">{l.contactName}</h3>
                <p className="text-xs text-slate-500">{l.companyName || l.industry || "No company name"}</p>
                <div className="mt-2 flex items-center gap-2">
                  {getStatusBadge(l.status)}
                  <span className="text-xs text-slate-400">• {l.source}</span>
                </div>
                <div className="mt-3 p-2 bg-slate-50 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Phone:</span>
                    <span className="font-mono font-medium">{l.phone}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Assigned:</span>
                    <span className="font-semibold text-slate-800">{l.assignedTo?.name || "Unassigned"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => openWhatsApp(l.phone, l.contactName)}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1"
                >
                  <MessageSquare size={13} /> WhatsApp
                </button>
                <button
                  onClick={() => setSelectedLeadForDetail(l)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LEAD DETAIL DRAWER MODAL */}
      {selectedLeadForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto flex flex-col">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedLeadForDetail.contactName}</h2>
                  <span className="font-mono text-xs text-slate-500 font-semibold">({selectedLeadForDetail.customId})</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selectedLeadForDetail.companyName || "No Company"} • {selectedLeadForDetail.city || "India"}</p>
              </div>
              <button
                onClick={() => setSelectedLeadForDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedLeadForDetail.phone}`}
                  className="flex-1 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition"
                >
                  <Phone size={14} /> Call Now
                </a>
                <button
                  onClick={() => openWhatsApp(selectedLeadForDetail.phone, selectedLeadForDetail.contactName)}
                  className="flex-1 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <MessageSquare size={14} /> WhatsApp
                </button>
                <button
                  onClick={() => {
                    const l = selectedLeadForDetail;
                    setSelectedLeadForDetail(null);
                    setSelectedLeadForFollowUp(l);
                  }}
                  className="flex-1 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Clock size={14} /> Follow-up
                </button>
                {selectedLeadForDetail.status !== "WON" && (
                  <button
                    onClick={() => {
                      const l = selectedLeadForDetail;
                      setSelectedLeadForDetail(null);
                      setSelectedLeadForConvert(l);
                    }}
                    className="flex-1 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <CheckCircle2 size={14} /> Convert
                  </button>
                )}
              </div>

              {/* Status & Priority */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedLeadForDetail.status)}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Priority:</span>
                  <div className="mt-1">{getPriorityBadge(selectedLeadForDetail.priority)}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Assigned Telecaller:</span>
                  <span className="font-bold text-slate-800">{selectedLeadForDetail.assignedTo?.name || "Unassigned"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Lead Source:</span>
                  <span className="font-semibold text-blue-700">{selectedLeadForDetail.source}</span>
                </div>
              </div>

              {/* Qualification Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Qualification & Advertising Background
                </h4>
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Previous Meta Ads Experience:</span>
                    <span className="font-semibold text-slate-800">{selectedLeadForDetail.previousMetaAdsExp || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Previous Daily Ad Budget:</span>
                    <span className="font-semibold text-slate-800">{selectedLeadForDetail.prevMetaDailyBudget ? `₹${selectedLeadForDetail.prevMetaDailyBudget}` : "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Target Monthly Marketing Budget:</span>
                    <span className="font-semibold text-emerald-700">{selectedLeadForDetail.budget || "Not specified"}</span>
                  </div>
                  {selectedLeadForDetail.customerRequirements && (
                    <div className="pt-2">
                      <span className="text-slate-500 block font-semibold">Requirements:</span>
                      <p className="text-slate-700 mt-0.5">{selectedLeadForDetail.customerRequirements}</p>
                    </div>
                  )}
                  {selectedLeadForDetail.objections && (
                    <div className="pt-2">
                      <span className="text-slate-500 block font-semibold">Customer Objections:</span>
                      <p className="text-amber-800 mt-0.5">{selectedLeadForDetail.objections}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sales Activity History */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Sales Activity History
                </h4>
                <div className="space-y-2.5">
                  {selectedLeadForDetail.activities?.map((act: any) => (
                    <div key={act.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span className="font-semibold text-blue-600">{act.type}</span>
                        <span>{formatDateTimeIST(act.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-slate-700 font-medium">{act.notes}</p>
                    </div>
                  )) || <p className="text-xs text-slate-400 italic">No prior activity logged.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <LeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchLeads}
        employees={employees}
        campaigns={campaigns}
      />

      <ConvertLeadModal
        isOpen={!!selectedLeadForConvert}
        onClose={() => setSelectedLeadForConvert(null)}
        lead={selectedLeadForConvert}
        onSuccess={fetchLeads}
      />

      <FollowUpModal
        isOpen={!!selectedLeadForFollowUp}
        onClose={() => setSelectedLeadForFollowUp(null)}
        lead={selectedLeadForFollowUp}
        onSuccess={fetchLeads}
      />
    </div>
  );
}
