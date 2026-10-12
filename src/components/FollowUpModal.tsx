"use client";

import { useState } from "react";
import { X, Calendar, Clock, Phone, MessageSquare, Mail, Users } from "lucide-react";

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  existingFollowUp?: any;
  onSuccess: () => void;
}

export function FollowUpModal({
  isOpen,
  onClose,
  lead,
  existingFollowUp,
  onSuccess,
}: FollowUpModalProps) {
  const [scheduledAt, setScheduledAt] = useState(
    existingFollowUp?.scheduledAt
      ? new Date(existingFollowUp.scheduledAt).toISOString().slice(0, 16)
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [type, setType] = useState(existingFollowUp?.type || "CALL");
  const [reminderInterval, setReminderInterval] = useState(
    existingFollowUp?.reminderIntervalMinutes || 15
  );
  const [notes, setNotes] = useState(existingFollowUp?.notes || "");
  const [outcome, setOutcome] = useState(existingFollowUp?.outcome || "");
  const [nextAction, setNextAction] = useState(existingFollowUp?.nextAction || "");
  const [isCompleting, setIsCompleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (existingFollowUp) {
        // Update existing follow-up
        const res = await fetch("/api/follow-ups", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: existingFollowUp.id,
            status: isCompleting ? "COMPLETED" : "SCHEDULED",
            outcome,
            nextAction,
            notes,
            scheduledAt,
          }),
        });
        if (!res.ok) throw new Error("Failed to update follow-up");
      } else {
        // Schedule new follow-up
        const res = await fetch("/api/follow-ups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: lead.id,
            scheduledAt,
            type,
            reminderIntervalMinutes: reminderInterval,
            notes,
            nextAction,
          }),
        });
        if (!res.ok) throw new Error("Failed to schedule follow-up");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {existingFollowUp ? "Update Follow-up Call" : "Schedule Follow-up"}
            </h2>
            <p className="text-xs text-slate-600">
              {lead.contactName} ({lead.phone})
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Date & Exact Time (Asia/Kolkata) *</label>
            <input
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Follow-up Channel</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="CALL">Phone Call 📞</option>
                <option value="WHATSAPP">WhatsApp 💬</option>
                <option value="EMAIL">Email ✉️</option>
                <option value="MEETING">Google Meet 🤝</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Reminder Timing</label>
              <select
                value={reminderInterval}
                onChange={(e) => setReminderInterval(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value={30}>30 mins before</option>
                <option value={15}>15 mins before</option>
                <option value={5}>5 mins before</option>
                <option value={0}>At scheduled time</option>
              </select>
            </div>
          </div>

          {existingFollowUp && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="completeCheck"
                  checked={isCompleting}
                  onChange={(e) => setIsCompleting(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="completeCheck" className="text-xs font-bold text-slate-800">
                  Mark this follow-up as Completed
                </label>
              </div>

              {isCompleting && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Call Outcome / Result *</label>
                  <select
                    value={outcome}
                    required={isCompleting}
                    onChange={(e) => setOutcome(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">Select Outcome...</option>
                    <option value="Call Connected - Positive Interest">Call Connected - Positive Interest</option>
                    <option value="Proposal Sent - Reviewing Pricing">Proposal Sent - Reviewing Pricing</option>
                    <option value="Requested Callback Tomorrow">Requested Callback Tomorrow</option>
                    <option value="Not Reachable / Busy">Not Reachable / Busy</option>
                    <option value="Wrong Number / Invalid">Wrong Number / Invalid</option>
                    <option value="Not Interested / Lost">Not Interested / Lost</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">Follow-up Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Customer mentioned call tomorrow at 4 PM to finalize proposal..."
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Next Action Planned</label>
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="Send WhatsApp rate card or schedule Zoom walkthrough"
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : existingFollowUp ? "Update Follow-up" : "Schedule Follow-up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
