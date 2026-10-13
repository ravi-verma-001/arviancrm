"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  Plus,
  Mail,
  Clock,
  ShieldCheck,
  Briefcase,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { formatDateIST } from "@/lib/utils";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("ALL");

  // Add modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formEmpId, setFormEmpId] = useState("");
  const [formDept, setFormDept] = useState("Sales / Telecalling");
  const [formRole, setFormRole] = useState("SALES_EXECUTIVE");
  const [formDesignation, setFormDesignation] = useState("Sales Representative");
  const [formPhone, setFormPhone] = useState("");
  const [formPass, setFormPass] = useState("");
  const [showAddPass, setShowAddPass] = useState(false);

  // Edit modal
  const [editEmp, setEditEmp] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editHours, setEditHours] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // ── Add Employee ─────────────────────────────────────────
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
          phone: formPhone,
          password: formPass || "password123",
        }),
      });
      if (res.ok) {
        setIsAddOpen(false);
        setFormName(""); setFormEmail(""); setFormEmpId(""); setFormPhone(""); setFormPass("");
        fetchEmployees();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add employee");
      }
    } catch {
      alert("Network error");
    }
  };

  // ── Open Edit Modal ────────────────────────────────────
  const openEdit = (emp: any) => {
    setEditEmp(emp);
    setEditName(emp.name);
    setEditEmail(emp.email);
    setEditPhone(emp.phone || "");
    setEditDept(emp.department);
    setEditDesignation(emp.designation);
    setEditRole(emp.role);
    setEditStatus(emp.status);
    setEditHours(emp.workingHours);
    setNewPass("");
    setShowNewPass(false);
  };

  // ── Save Edit ──────────────────────────────────────────
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmp) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/employees/${editEmp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          department: editDept,
          designation: editDesignation,
          role: editRole,
          status: editStatus,
          workingHours: editHours,
          newPassword: newPass || undefined,
        }),
      });
      if (res.ok) {
        setEditEmp(null);
        setNewPass("");
        fetchEmployees();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update employee");
      }
    } catch {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete Employee ────────────────────────────────────
  const handleDelete = async (emp: any) => {
    if (!confirm(`Are you sure you want to remove ${emp.name} from the system?`)) return;
    try {
      const res = await fetch(`/api/employees/${emp.id}`, { method: "DELETE" });
      if (res.ok) {
        fetchEmployees();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete employee");
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
      <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
        <ShieldCheck size={16} className="text-blue-600 shrink-0" />
        <span>
          <strong>Salary &amp; Compensation Privacy Enforced:</strong> Financial payroll records are strictly restricted to Super Admin and never exposed in the general employee directory.
        </span>
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
      ) : employees.length === 0 ? (
        <div className="p-12 text-center text-sm text-slate-400">
          No employees found. Add your first team member!
        </div>
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
                  <div className="flex items-center gap-1">
                    {/* Edit Button */}
                    <button
                      onClick={() => openEdit(emp)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Employee"
                    >
                      <Pencil size={13} />
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(emp)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remove Employee"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
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
                <span className={`font-semibold ${emp.status === "ACTIVE" ? "text-emerald-600" : "text-red-500"}`}>
                  • {emp.status === "ACTIVE" ? "Active" : emp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD EMPLOYEE MODAL ── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add Agency Staff Member</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Full Name *</label>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ankit Sharma"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Work Email *</label>
                <input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ankit@yourcompany.com"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Employee ID *</label>
                  <input type="text" required value={formEmpId} onChange={(e) => setFormEmpId(e.target.value)}
                    placeholder="ARV-EMP-102"
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none font-mono focus:border-blue-400" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Phone</label>
                  <input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Role</label>
                  <select value={formRole} onChange={(e) => setFormRole(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none">
                    <option value="SALES_EXECUTIVE">Sales / Telecaller</option>
                    <option value="GRAPHIC_DESIGNER">Graphic Designer</option>
                    <option value="SOCIAL_MEDIA_MANAGER">Social Media Manager</option>
                    <option value="META_ADS_MANAGER">Meta Ads Manager</option>
                    <option value="SUPER_ADMIN">Agency Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Department</label>
                  <input type="text" value={formDept} onChange={(e) => setFormDept(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Designation</label>
                <input type="text" value={formDesignation} onChange={(e) => setFormDesignation(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400" />
              </div>

              {/* Password Field */}
              <div className="pt-1 border-t border-slate-100">
                <label className="block font-semibold text-slate-700 flex items-center gap-1.5">
                  <KeyRound size={12} className="text-slate-400" />
                  Login Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showAddPass ? "text" : "password"}
                    value={formPass}
                    onChange={(e) => setFormPass(e.target.value)}
                    placeholder="Default: password123 (change recommended)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400 pr-9"
                  />
                  <button type="button" onClick={() => setShowAddPass(!showAddPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    {showAddPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-amber-600 font-medium">
                  ⚠️ Employee will login with this password. Share it securely.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT EMPLOYEE MODAL ── */}
      {editEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Edit Employee — {editEmp.name}</h3>
              <button onClick={() => setEditEmp(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Full Name *</label>
                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Email *</label>
                  <input type="email" required value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Phone</label>
                  <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Role</label>
                  <select value={editRole} onChange={(e) => setEditRole(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none">
                    <option value="SALES_EXECUTIVE">Sales / Telecaller</option>
                    <option value="GRAPHIC_DESIGNER">Graphic Designer</option>
                    <option value="SOCIAL_MEDIA_MANAGER">Social Media Manager</option>
                    <option value="META_ADS_MANAGER">Meta Ads Manager</option>
                    <option value="SUPER_ADMIN">Agency Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Department</label>
                  <input type="text" value={editDept} onChange={(e) => setEditDept(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Designation</label>
                  <input type="text" value={editDesignation} onChange={(e) => setEditDesignation(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Working Hours</label>
                <input type="text" value={editHours} onChange={(e) => setEditHours(e.target.value)}
                  placeholder="10:00 AM - 07:00 PM IST"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400" />
              </div>

              {/* Reset Password Section */}
              <div className="pt-2 border-t border-dashed border-slate-200">
                <label className="block font-semibold text-slate-700 flex items-center gap-1.5">
                  <KeyRound size={12} className="text-blue-500" />
                  Reset Login Password
                  <span className="text-[9px] font-normal text-slate-400 ml-1">(leave blank to keep current)</span>
                </label>
                <div className="relative mt-1">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400 pr-9"
                  />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {newPass && newPass.length < 6 && (
                  <p className="mt-1 text-[10px] text-red-500">Password must be at least 6 characters.</p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditEmp(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
