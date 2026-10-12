"use client";

import { useState, useEffect } from "react";
import {
  PhoneCall,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  User,
  Filter,
} from "lucide-react";
import { formatDateTimeIST } from "@/lib/utils";
import { FollowUpModal } from "@/components/FollowUpModal";

export default function FollowUpsPage() {
  const [view, setView] = useState("today"); // today, upcoming, overdue, completed
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForEdit, setSelectedForEdit] = useState<any>(null);

  useEffect(() => {
    fetchFollowUps();
  }, [view]);

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/follow-ups?view=${view}`);
      const data = await res.json();
      setFollowUps(data.followUps || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (phone: string, name: string) => {
    const clean = phone.replace(/\D/g, "");
    const msg = encodeURIComponent(`Hi ${name}, this is Arvian Marketing following up as scheduled regarding your digital marketing requirements.`);
    window.open(`https://wa.me/${clean}?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PhoneCall className="text-amber-600" />
            Follow-up Management & Reminders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Never drop a deal — schedule, execute, and log multi-attempt customer follow-ups (Asia/Kolkata IST)
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setView("today")}
            className={`px-3 py-1.5 rounded-lg transition ${
              view === "today" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Today&apos;s Calls
          </button>
          <button
            onClick={() => setView("upcoming")}
            className={`px-3 py-1.5 rounded-lg transition ${
              view === "upcoming" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setView("overdue")}
            className={`px-3 py-1.5 rounded-lg transition ${
              view === "overdue" ? "bg-white text-red-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => setView("completed")}
            className={`px-3 py-1.5 rounded-lg transition ${
              view === "completed" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Follow-ups List */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Loading follow-ups queue...</div>
      ) : followUps.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-xs">
          <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
          <h3 className="font-semibold text-slate-800 text-sm">All clear! No follow-ups in this queue</h3>
          <p className="text-xs text-slate-400 mt-1">Check other tabs or schedule new follow-ups from the Leads CRM.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {followUps.map((fu) => (
            <div
              key={fu.id}
              className={`bg-white p-5 rounded-xl border shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                view === "overdue" ? "border-red-200 hover:border-red-300" : "border-slate-200 hover:border-amber-300"
              }`}
            >
              {/* Left Details */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400 font-semibold">{fu.lead?.customId}</span>
                  <span className="text-sm font-bold text-slate-900">{fu.lead?.contactName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Attempt #{fu.attemptNumber}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {fu.type}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-mono">{fu.lead?.phone}</span>
                  {fu.lead?.companyName && <span>• {fu.lead?.companyName}</span>}
                  <span>• Assigned: <strong className="text-slate-700">{fu.assignedTo?.name}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50/60 p-2 rounded-lg border border-amber-100/80">
                  <Clock size={13} className="text-amber-600 shrink-0" />
                  <span>Scheduled At: {formatDateTimeIST(fu.scheduledAt)} IST</span>
                  <span className="text-slate-400 font-normal">({fu.reminderIntervalMinutes}m reminder set)</span>
                </div>

                {fu.notes && (
                  <p className="text-xs text-slate-600 italic">
                    &ldquo;{fu.notes}&rdquo;
                  </p>
                )}

                {fu.outcome && (
                  <div className="text-xs text-emerald-800 bg-emerald-50 px-2 py-1 rounded inline-block font-medium">
                    Outcome: {fu.outcome}
                  </div>
                )}
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${fu.lead?.phone}`}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Phone size={13} /> Call
                </a>

                <button
                  onClick={() => openWhatsApp(fu.lead?.phone, fu.lead?.contactName)}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  <MessageSquare size={13} /> WhatsApp
                </button>

                {fu.status === "SCHEDULED" && (
                  <button
                    onClick={() => setSelectedForEdit(fu)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} /> Log Result
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedForEdit && (
        <FollowUpModal
          isOpen={true}
          onClose={() => setSelectedForEdit(null)}
          lead={selectedForEdit.lead}
          existingFollowUp={selectedForEdit}
          onSuccess={fetchFollowUps}
        />
      )}
    </div>
  );
}
