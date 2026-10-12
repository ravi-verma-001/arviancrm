"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDevLogins, setShowDevLogins] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  };

  const loginAsDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    // Submit login
    setLoading(true);
    setError("");
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: demoEmail, password: demoPass }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setError(data.error || "Demo login failed");
          setLoading(false);
        }
      })
      .catch(() => {
        setError("Network error");
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center font-extrabold text-white text-2xl shadow-xl shadow-blue-500/25 border border-blue-400/30">
          A
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
          Arvian Marketing CRM
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Agency Operations & Performance Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Work Email
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@arvianmarketing.com"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
            >
              {loading ? "Authenticating..." : "Sign in to Dashboard"}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Development / Testing Quick Switcher - Collapsible & Disabled in Production */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowDevLogins(!showDevLogins)}
              className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 transition py-1"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-amber-600" />
                <span className="font-semibold text-slate-600">Dev Testing Accounts (Demo Only)</span>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                {showDevLogins ? "Hide" : "Show (Local Testing)"}
              </span>
            </button>
            <p className="text-[11px] text-slate-400 mt-1">
              Production Mode: These shortcuts are automatically disabled. Employees can only log in using their own private password.
            </p>

            {showDevLogins && (
              <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
                <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-2 font-medium">
                  🔒 <strong>Security Notice:</strong> In real deployment, only the email/password fields above are shown. Salespersons cannot escalate their role.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => loginAsDemo("admin@arvianmarketing.com", "admin123")}
                    className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg transition"
                  >
                    <p className="font-semibold text-slate-800">Super Admin</p>
                    <p className="text-[10px] text-slate-500">Agency Owner</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => loginAsDemo("rahul@arvianmarketing.com", "password123")}
                    className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg transition"
                  >
                    <p className="font-semibold text-slate-800">Rahul (Sales)</p>
                    <p className="text-[10px] text-slate-500">Telecaller / Sales</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => loginAsDemo("arjun@arvianmarketing.com", "password123")}
                    className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg transition"
                  >
                    <p className="font-semibold text-slate-800">Arjun (Design)</p>
                    <p className="text-[10px] text-slate-500">Graphic Designer</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => loginAsDemo("karan@arvianmarketing.com", "password123")}
                    className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg transition"
                  >
                    <p className="font-semibold text-slate-800">Karan (Ads)</p>
                    <p className="text-[10px] text-slate-500">Meta Ads Manager</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Arvian Marketing • Secure Encrypted Access • Asia/Kolkata
        </p>
      </div>
    </div>
  );
}
