"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Users2, Briefcase, Target, CheckSquare, UserCheck, Receipt } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    leads: any[];
    clients: any[];
    campaigns: any[];
    tasks: any[];
    employees: any[];
    invoices: any[];
  }>({
    leads: [],
    clients: [],
    campaigns: [],
    tasks: [],
    employees: [],
    invoices: [],
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ leads: [], clients: [], campaigns: [], tasks: [], employees: [], invoices: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  const hasResults =
    results.leads.length > 0 ||
    results.clients.length > 0 ||
    results.campaigns.length > 0 ||
    results.tasks.length > 0 ||
    results.employees.length > 0 ||
    results.invoices.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="relative flex items-center px-4 border-b border-slate-100">
          <Search className="text-slate-400 shrink-0" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads, clients, campaigns, tasks, employees..."
            autoFocus
            className="w-full py-4 pl-3 pr-8 text-sm focus:outline-none placeholder:text-slate-400 text-slate-800"
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {loading && (
            <p className="text-center text-sm text-slate-400 py-6">Searching database...</p>
          )}

          {!loading && !hasResults && query.length >= 2 && (
            <div className="text-center py-8">
              <p className="text-sm font-medium text-slate-600">No matching records found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by contact name, phone number, client ID or campaign title.</p>
            </div>
          )}

          {!loading && !hasResults && query.length < 2 && (
            <p className="text-center text-xs text-slate-400 py-6">
              Type at least 2 characters to search across Arvian CRM...
            </p>
          )}

          {/* Leads */}
          {results.leads.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users2 size={13} /> Leads
              </p>
              <div className="space-y-1">
                {results.leads.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => navigateTo(`/leads?search=${l.customId}`)}
                    className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition text-sm group"
                  >
                    <div>
                      <span className="font-medium text-slate-800 group-hover:text-blue-600">
                        {l.contactName}
                      </span>
                      <span className="text-xs text-slate-400 ml-2 font-mono">({l.customId})</span>
                      {l.companyName && <span className="text-xs text-slate-500 ml-2">• {l.companyName}</span>}
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {l.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clients */}
          {results.clients.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase size={13} /> Clients
              </p>
              <div className="space-y-1">
                {results.clients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigateTo(`/clients/${c.id}`)}
                    className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition text-sm group"
                  >
                    <div>
                      <span className="font-medium text-slate-800 group-hover:text-blue-600">
                        {c.businessName}
                      </span>
                      <span className="text-xs text-slate-400 ml-2 font-mono">({c.customId})</span>
                      <span className="text-xs text-slate-500 ml-2">• {c.primaryContact}</span>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                      {c.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Campaigns */}
          {results.campaigns.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target size={13} /> Campaigns
              </p>
              <div className="space-y-1">
                {results.campaigns.map((camp) => (
                  <button
                    key={camp.id}
                    onClick={() => navigateTo(`/campaigns`)}
                    className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition text-sm group"
                  >
                    <span className="font-medium text-slate-800 group-hover:text-blue-600 truncate">
                      {camp.name}
                    </span>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium shrink-0 ml-2">
                      {camp.objective}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {results.tasks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckSquare size={13} /> Tasks
              </p>
              <div className="space-y-1">
                {results.tasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => navigateTo(`/projects`)}
                    className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition text-sm group"
                  >
                    <span className="font-medium text-slate-800 group-hover:text-blue-600 truncate">
                      {t.title}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium shrink-0 ml-2">
                      {t.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Employees */}
          {results.employees.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserCheck size={13} /> Employees
              </p>
              <div className="space-y-1">
                {results.employees.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => navigateTo(`/employees`)}
                    className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition text-sm group"
                  >
                    <div>
                      <span className="font-medium text-slate-800 group-hover:text-blue-600">
                        {e.name}
                      </span>
                      <span className="text-xs text-slate-400 ml-2 font-mono">({e.employeeId})</span>
                    </div>
                    <span className="text-xs text-slate-500">{e.department}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Navigation: Click result or press ESC to exit</span>
          <span className="font-mono">Ctrl+K / ⌘K</span>
        </div>
      </div>
    </div>
  );
}
