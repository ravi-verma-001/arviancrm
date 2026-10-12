"use client";

import { useState } from "react";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employees: any[];
  campaigns: any[];
}

export function LeadModal({ isOpen, onClose, onSuccess, employees, campaigns }: LeadModalProps) {
  const [formData, setFormData] = useState({
    contactName: "",
    phone: "",
    email: "",
    companyName: "",
    industry: "E-commerce / D2C",
    city: "Mumbai",
    website: "",
    instagramHandle: "",
    source: "META_ADS",
    priority: "MEDIUM",
    status: "NEW",
    servicesInterested: ["Meta Ads"],
    budget: "₹50,000 - ₹1,00,000 / month",
    previousMarketingExp: "YES",
    previousMetaAdsExp: "YES",
    prevMetaDailyBudget: "1500",
    prevMetaMonthlyBudget: "45000",
    prevCampaignResults: "",
    adAccountNotes: "",
    customerRequirements: "",
    objections: "",
    competitorInfo: "",
    notes: "",
    assignedToId: "",
    campaignId: "",
    nextFollowUpDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const servicesList = [
    "Meta Ads",
    "Instagram Management",
    "Social Media Marketing",
    "Graphic Design",
    "Website Development",
    "Landing Page Development",
    "SEO",
    "Local SEO",
  ];

  const handleServiceToggle = (s: string) => {
    setFormData((prev) => {
      const exists = prev.servicesInterested.includes(s);
      return {
        ...prev,
        servicesInterested: exists
          ? prev.servicesInterested.filter((item) => item !== s)
          : [...prev.servicesInterested, s],
      };
    });
  };

  const checkDuplicate = async () => {
    if (!formData.phone && !formData.email) return;
    try {
      const res = await fetch("/api/leads/duplicate-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, email: formData.email }),
      });
      const data = await res.json();
      if (data.isDuplicate) {
        setDuplicateWarning(data.duplicates[0]);
      } else {
        setDuplicateWarning(null);
      }
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent, allowDuplicate = false) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, allowDuplicate }),
      });

      const data = await res.json();

      if (res.status === 409 && data.isDuplicate) {
        setDuplicateWarning(data.duplicateLead);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Failed to create lead");
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Create New Lead Profile</h2>
            <p className="text-xs text-slate-500">Enter prospective client data, qualification details & campaign attribution</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Duplicate Warning Alert */}
        {duplicateWarning && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start justify-between">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-bold">Duplicate Lead Warning Detected!</p>
                <p className="mt-0.5">
                  A lead with matching details already exists:{" "}
                  <strong>{duplicateWarning.contactName}</strong> ({duplicateWarning.customId}, {duplicateWarning.status}).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="px-3 py-1 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 shrink-0 text-xs shadow-xs"
            >
              Confirm Duplicate & Save
            </button>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Contact & Company */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              1. Contact & Business Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Contact / Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="e.g. Vikram Singhania"
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Phone Number (with Country Code) *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onBlur={checkDuplicate}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Work Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onBlur={checkDuplicate}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@business.in"
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Company / Business Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Skyline Luxury Realty"
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Industry / Niche</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="Real Estate, D2C, Healthcare, etc."
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">City / Location</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Mumbai, Delhi, Bangalore, etc."
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Instagram Handle</label>
                <input
                  type="text"
                  value={formData.instagramHandle}
                  onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                  placeholder="@brandname"
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Website URL</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://business.in"
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Services & Pipeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              2. Services Interest & Pipeline
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Interested Services (Select multiple)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {servicesList.map((s) => {
                    const selected = formData.servicesInterested.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => handleServiceToggle(s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                          selected
                            ? "bg-blue-50 text-blue-700 border-blue-400 font-semibold"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Lead Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="META_ADS">Meta Ads (Internal Campaign)</option>
                    <option value="INSTAGRAM_ORGANIC">Instagram Organic</option>
                    <option value="FB_ORGANIC">Facebook Organic</option>
                    <option value="WEBSITE_FORM">Website Form</option>
                    <option value="WHATSAPP">WhatsApp Inbound</option>
                    <option value="PHONE_CALL">Phone Call Inbound</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="GOOGLE_ADS">Google Ads</option>
                    <option value="MANUAL">Manual Outbound Entry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Pipeline Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="NEW">New Lead</option>
                    <option value="NOT_CONTACTED">Not Contacted</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="INTERESTED">Interested</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="FOLLOW_UP_REQUIRED">Follow-up Required</option>
                    <option value="PROPOSAL_SENT">Proposal Sent</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="WON">Won / Converted</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent 🔥</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Assign To Sales Executive</label>
                  <select
                    value={formData.assignedToId}
                    onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employeeId} - {emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Attributed Campaign</label>
                  <select
                    value={formData.campaignId}
                    onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="">None / Organic</option>
                    {campaigns.map((camp) => (
                      <option key={camp.id} value={camp.id}>
                        {camp.name} ({camp.objective})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Lead Qualification & Meta Ads Experience */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              3. Sales Qualification & Meta Ads Experience
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Previous Meta Ads Exp?</label>
                <select
                  value={formData.previousMetaAdsExp}
                  onChange={(e) => setFormData({ ...formData, previousMetaAdsExp: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Previous Daily Ad Budget (₹)</label>
                <input
                  type="number"
                  value={formData.prevMetaDailyBudget}
                  onChange={(e) => setFormData({ ...formData, prevMetaDailyBudget: e.target.value })}
                  placeholder="1500"
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Expected Monthly Budget</label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="₹50,000 - ₹1,00,000 / month"
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Customer Requirements & Goals</label>
                <textarea
                  rows={2}
                  value={formData.customerRequirements}
                  onChange={(e) => setFormData({ ...formData, customerRequirements: e.target.value })}
                  placeholder="Needs 50+ qualified inquiries/month, wants Instagram reels makeover..."
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Customer Objections</label>
                <textarea
                  rows={2}
                  value={formData.objections}
                  onChange={(e) => setFormData({ ...formData, objections: e.target.value })}
                  placeholder="Concerned about ad spend ROI, previous bad freelancer experience..."
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit Bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 transition"
            >
              {loading ? "Saving Lead..." : "Save Lead Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
