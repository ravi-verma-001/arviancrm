"use client";

import { useState } from "react";
import { X, CheckCircle2, IndianRupee } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  onSuccess: () => void;
}

export function ConvertLeadModal({ isOpen, onClose, lead, onSuccess }: ConvertLeadModalProps) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(lead?.companyName || lead?.contactName + "'s Business");
  const [monthlyServiceFee, setMonthlyServiceFee] = useState("45000");
  const [adBudget, setAdBudget] = useState("50000");
  const [paymentTerms, setPaymentTerms] = useState("Advance Monthly");
  const [servicesPurchased, setServicesPurchased] = useState<string[]>(
    (() => {
      try {
        return JSON.parse(lead?.servicesInterested || '["Meta Ads"]');
      } catch {
        return ["Meta Ads"];
      }
    })()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !lead) return null;

  const servicesOptions = [
    "Meta Ads",
    "Instagram Management",
    "Social Media Marketing",
    "Graphic Design",
    "Website Development",
    "Landing Page Development",
    "SEO",
  ];

  const toggleService = (s: string) => {
    setServicesPurchased((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/leads/${lead.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          monthlyServiceFee,
          adBudget,
          paymentTerms,
          servicesPurchased,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to convert lead to client");
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
      if (data.client?.id) {
        router.push(`/clients/${data.client.id}`);
      }
    } catch {
      setError("Network error occurred during conversion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Convert Lead to Paying Client</h2>
              <p className="text-xs text-slate-500">Preserves original lead history ({lead.customId})</p>
            </div>
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

        <form onSubmit={handleConvert} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Client / Company Name *</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Services Retainer</label>
            <div className="flex flex-wrap gap-1.5">
              {servicesOptions.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleService(s)}
                  className={`px-2 py-1 rounded text-[11px] font-medium border transition ${
                    servicesPurchased.includes(s)
                      ? "bg-emerald-50 text-emerald-700 border-emerald-400 font-bold"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  {servicesPurchased.includes(s) ? "✓ " : "+ "}
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Monthly Agency Fee (₹) *
              </label>
              <input
                type="number"
                required
                value={monthlyServiceFee}
                onChange={(e) => setMonthlyServiceFee(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Arvian agency retainer</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Client Ad Budget (₹)
              </label>
              <input
                type="number"
                value={adBudget}
                onChange={(e) => setAdBudget(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Tracked separately</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Payment Terms</label>
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="Advance Monthly">Advance Monthly (1st of month)</option>
              <option value="Net 15">Net 15 Days</option>
              <option value="50% Advance 50% Milestone">50% Advance, 50% Milestone</option>
              <option value="Quarterly Advance">Quarterly Advance</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Automatic Onboarding Actions:</p>
            <p>• Assigns unique Client ID and moves lead status to WON.</p>
            <p>• Creates initial Onboarding Sprint project with 3 setup tasks.</p>
            <p>• Generates Month 1 retainer invoice automatically.</p>
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
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {loading ? "Converting..." : "Complete Conversion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
