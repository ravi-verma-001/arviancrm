"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { formatDateIST } from "@/lib/utils";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formEmpId, setFormEmpId] = useState("");
  const [formDept, setFormDept] = useState("Sales / Telecalling");
  const [formRole, setFormRole] = useState("SALES_EXECUTIVE");
  const [formDesignation, setFormDesignation] = useState("Sales Representative");

  useEffect(() => {
    fetchEmployees();
  }, [deptFilter]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (deptFilter !== "ALL") params.append("department", deptFilter);
      const res = await fetch(`/api/employees?${params.toString()}`);
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          employeeId: formEmpId,
          department: formDept,
          role: formRole,
          designation: formDesignation,
        }),
      });
      if (res.ok) {
        setIsAddOpen(false);
        setFormName("");
        setFormEmail("");
        setFormEmpId("");
        fetchEmployees();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add employee");
      }
    } catch {
      alert("Network error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="text-blue-600" />
            Agency Employee Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Team members across Sales, Meta Ads, Creative Design, Social Media, and Leadership
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
        >
          <Plus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Security Privacy Notice */}
      <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-blue-600 shrink-0" />
          <span>
            <strong>Salary & Compensation Privacy Enforced:</strong> Financial payroll records are strictly restricted to Super Admin and never exposed in the general employee directory.
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
        {["ALL", "Sales", "Meta Ads", "Social Media", "Design", "Management"].map((dept) => (
          <button
            key={dept}
            onClick={() => setDeptFilter(dept)}
            className={`px-3 py-1.5 rounded-lg border transition ${
              deptFilter === dept
                ? "bg-blue-600 text-white border-blue-600 font-bold"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {dept === "ALL" ? "All Departments" : dept}
          </button>
        ))}
      </div>

      {/* Employees Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Loading directory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{emp.name}</h3>
                      <p className="text-[11px] text-slate-500">{emp.designation}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    {emp.employeeId}
                  </span>
                </div>

                <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-slate-400" />
                    <span className="font-mono text-[11px] text-slate-700">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={13} className="text-slate-400" />
                    <span>{emp.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-slate-400" />
                    <span className="text-[11px]">{emp.workingHours}</span>
                  </div>
                </div>

                {/* Role Specific KPIs */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1 text-center text-xs">
                  <div className="bg-slate-50 p-1.5 rounded">
                    <span className="text-[10px] text-slate-400 block">Leads</span>
                    <strong className="text-slate-800 font-bold">{emp._count?.assignedLeads || 0}</strong>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded">
                    <span className="text-[10px] text-slate-400 block">Tasks</span>
                    <strong className="text-slate-800 font-bold">{emp._count?.assignedTasks || 0}</strong>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded">
                    <span className="text-[10px] text-slate-400 block">Calls</span>
                    <strong className="text-slate-800 font-bold">{emp._count?.followUps || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Joined: {formatDateIST(emp.dateOfJoining)}</span>
                <span className="text-emerald-600 font-semibold">• Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Agency Staff Member</h3>
            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ankit Sharma"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Work Email *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ankit@arvianmarketing.com"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={formEmpId}
                    onChange={(e) => setFormEmpId(e.target.value)}
                    placeholder="ARV-EMP-105"
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="SALES_EXECUTIVE">Sales / Telecaller</option>
                    <option value="GRAPHIC_DESIGNER">Graphic Designer</option>
                    <option value="SOCIAL_MEDIA_MANAGER">Social Media Manager</option>
                    <option value="META_ADS_MANAGER">Meta Ads Manager</option>
                    <option value="SUPER_ADMIN">Agency Super Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Department</label>
                <input
                  type="text"
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Designation</label>
                <input
                  type="text"
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
