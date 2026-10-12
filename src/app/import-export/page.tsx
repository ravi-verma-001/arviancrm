"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  FileText,
} from "lucide-react";

export default function ImportExportPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [csvRawText, setCsvRawText] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [commitResult, setCommitResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sampleCsvData = `Contact Name,Phone,Email,Company Name,City,Source,Budget
Vikram Kapoor,+91 98991 12233,vikram@kapoorenterprises.com,Kapoor Enterprises,Delhi,Google Ads,₹75000/mo
Sunita Mehra,+91 98882 23344,sunita@mehraexports.in,Mehra Exports,Mumbai,Meta Ads,₹50000/mo
Rajesh Khanna,+91 98773 34455,rajesh@khannadesigns.com,Khanna Designs,Pune,Website Form,₹100000/mo
Invalid Contact,,missingphone@test.com,No Phone Inc,Bengaluru,Manual,₹25000/mo`;

  const handleLoadSample = () => {
    setCsvRawText(sampleCsvData);
  };

  const handleValidate = async () => {
    if (!csvRawText.trim()) return alert("Please paste or upload CSV data first.");
    setLoading(true);

    try {
      // Parse CSV rows into objects
      const lines = csvRawText.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      const rows = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          obj[h] = values[idx] || "";
        });
        return obj;
      });

      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "leads",
          rows,
          mode: "validate",
        }),
      });

      const data = await res.json();
      setValidationResult({ ...data, parsedRows: rows });
      setStep(2);
    } catch {
      alert("Error validating spreadsheet");
    } finally {
      setLoading(false);
    }
  };

  const handleCommitImport = async () => {
    if (!validationResult?.parsedRows) return;
    setLoading(true);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "leads",
          rows: validationResult.parsedRows,
          mode: "commit",
        }),
      });

      const data = await res.json();
      setCommitResult(data);
      setStep(4);
    } catch {
      alert("Error committing import");
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
            <FileSpreadsheet className="text-emerald-600" />
            Lead Import & Export Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Guided 4-step wizard with automatic duplicate detection, column validation, and audit logging
          </p>
        </div>
      </div>

      {/* Wizard Steps Bar */}
      <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
        <div className={`p-3 rounded-xl border text-center transition ${step === 1 ? "bg-blue-50 border-blue-400 text-blue-700 font-bold" : "bg-white text-slate-500 border-slate-200"}`}>
          1. Upload & Paste Data
        </div>
        <div className={`p-3 rounded-xl border text-center transition ${step === 2 ? "bg-blue-50 border-blue-400 text-blue-700 font-bold" : "bg-white text-slate-500 border-slate-200"}`}>
          2. Validation & Duplicates
        </div>
        <div className={`p-3 rounded-xl border text-center transition ${step === 3 ? "bg-blue-50 border-blue-400 text-blue-700 font-bold" : "bg-white text-slate-500 border-slate-200"}`}>
          3. Final Review
        </div>
        <div className={`p-3 rounded-xl border text-center transition ${step === 4 ? "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold" : "bg-white text-slate-500 border-slate-200"}`}>
          4. Complete & Summary
        </div>
      </div>

      {/* STEP 1: UPLOAD & PASTE */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Step 1: Paste CSV Spreadsheet or Load Sample Data</h3>
            <button
              onClick={handleLoadSample}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Load Sample Data with Valid & Invalid Rows
            </button>
          </div>

          <textarea
            rows={8}
            value={csvRawText}
            onChange={(e) => setCsvRawText(e.target.value)}
            placeholder="Paste raw CSV text here with headers: Contact Name, Phone, Email, Company Name, City..."
            className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
          />

          <div className="flex justify-end">
            <button
              onClick={handleValidate}
              disabled={loading || !csvRawText.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? "Validating..." : "Validate Data & Check Duplicates →"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: VALIDATION & DUPLICATE PREVIEW */}
      {step === 2 && validationResult && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900">Step 2: Validation Results & Duplicate Analysis</h3>

          {/* Counts Strip */}
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border rounded-xl">
              <span className="text-slate-400 block text-[11px]">Total Rows Read</span>
              <strong className="text-slate-900 text-base">{validationResult.totalRows}</strong>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-emerald-700 block text-[11px]">Valid for Import</span>
              <strong className="text-emerald-800 text-base">{validationResult.validCount}</strong>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-amber-700 block text-[11px]">Duplicates Identified</span>
              <strong className="text-amber-800 text-base">{validationResult.duplicateCount}</strong>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-red-700 block text-[11px]">Invalid Rows (Missing fields)</span>
              <strong className="text-red-800 text-base">{validationResult.invalidCount}</strong>
            </div>
          </div>

          {/* Invalid Rows Report */}
          {validationResult.invalid?.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-red-600" /> Invalid Rows Detected (Will be skipped safely):
              </p>
              {validationResult.invalid.map((inv: any, idx: number) => (
                <p key={idx}>• Row {inv.rowNumber}: {inv.reason}</p>
              ))}
            </div>
          )}

          {/* Duplicate Rows Report */}
          {validationResult.duplicates?.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-600" /> Duplicate Contacts Detected (Will be skipped to prevent clutter):
              </p>
              {validationResult.duplicates.map((dup: any, idx: number) => (
                <p key={idx}>• Row {dup.rowNumber}: {dup.contactName} ({dup.phone}) — {dup.reason}</p>
              ))}
            </div>
          )}

          {/* Valid Preview */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sample Preview of Valid Rows</h4>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs font-mono space-y-1">
              {validationResult.preview?.map((p: any, i: number) => (
                <div key={i} className="text-slate-700">
                  {p.contactName} • {p.phone} • {p.companyName || "N/A"} • {p.source}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              ← Back to Edit Data
            </button>
            <button
              onClick={handleCommitImport}
              disabled={loading || validationResult.validCount === 0}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? "Importing..." : `Confirm & Commit ${validationResult.validCount} Valid Leads →`}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUMMARY */}
      {step === 4 && commitResult && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Import Completed Successfully!</h2>
          <p className="text-xs text-slate-600">
            Successfully committed <strong>{commitResult.importedCount}</strong> new leads to Arvian CRM with verified unique IDs.
            Skipped {commitResult.skippedDuplicates} duplicates and {commitResult.invalidCount} invalid rows.
          </p>
          <div className="pt-2">
            <a
              href="/leads"
              className="px-5 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-lg shadow-sm inline-block"
            >
              View in Leads CRM →
            </a>
          </div>
        </div>
      )}

      {/* Export Options Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Export CRM Datasets to CSV</h3>
        <p className="text-xs text-slate-500">
          Download real filtered records formatted for Excel, Google Sheets, or backup analysis
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="/api/export?module=leads"
            download
            className="p-4 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl transition flex items-center gap-3 text-left group"
          >
            <Download size={18} className="text-blue-600 shrink-0" />
            <div>
              <p className="font-bold text-xs text-slate-800 group-hover:text-blue-700">Export All Leads</p>
              <p className="text-[10px] text-slate-400">Complete pipeline, phones, statuses</p>
            </div>
          </a>

          <a
            href="/api/export?module=clients"
            download
            className="p-4 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 rounded-xl transition flex items-center gap-3 text-left group"
          >
            <Download size={18} className="text-purple-600 shrink-0" />
            <div>
              <p className="font-bold text-xs text-slate-800 group-hover:text-purple-700">Export Active Clients</p>
              <p className="text-[10px] text-slate-400">Retainers, ad budgets, renewal dates</p>
            </div>
          </a>

          <a
            href="/api/export?module=invoices"
            download
            className="p-4 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl transition flex items-center gap-3 text-left group"
          >
            <Download size={18} className="text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-xs text-slate-800 group-hover:text-emerald-700">Export Invoices</p>
              <p className="text-[10px] text-slate-400">Paid & outstanding billing summary</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
