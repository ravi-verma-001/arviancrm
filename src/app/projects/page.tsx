"use client";

import { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Briefcase,
  Clock,
  User,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { formatDateIST } from "@/lib/utils";

export default function ProjectsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("2026-10-18T18:00");
  const [taskAssignedId, setTaskAssignedId] = useState("");
  const [taskPriority, setTaskPriority] = useState("HIGH");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, pRes, cRes, eRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/projects"),
        fetch("/api/clients"),
        fetch("/api/employees"),
      ]);
      const tData = await tRes.json();
      const pData = await pRes.json();
      const cData = await cRes.json();
      const eData = await eRes.json();

      setTasks(tData.tasks || []);
      setProjects(pData.projects || []);
      setClients(cData.clients || []);
      setEmployees(eData.employees || []);
      if (eData.employees?.length > 0) setTaskAssignedId(eData.employees[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          dueDate: taskDueDate,
          assignedToId: taskAssignedId,
          priority: taskPriority,
          status: "NOT_STARTED",
          checklist: [
            { id: "1", text: "Requirements review", done: false },
            { id: "2", text: "Production execution", done: false },
            { id: "3", text: "Final sign-off", done: false },
          ],
        }),
      });
      if (res.ok) {
        setIsTaskModalOpen(false);
        setTaskTitle("");
        setTaskDesc("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateRecurringSprint = async (clientId: string) => {
    if (!confirm("Generate new Monthly SMM & Ads Sprint project instance for next month?")) return;
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "November 2026 Monthly Retainer Sprint",
          clientId,
          templateType: "MONTHLY_SMM",
        }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="text-blue-600" />
            Project & Deliverable Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate design briefs, copy sprints, campaign setups, and recurring monthly client projects
          </p>
        </div>

        <div className="flex items-center gap-2">
          {clients.length > 0 && (
            <button
              onClick={() => handleGenerateRecurringSprint(clients[0].id)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition"
            >
              <Sparkles size={14} />
              <span>Generate Monthly Sprint</span>
            </button>
          )}

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Active Projects Cards */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Active Agency Client Projects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <div key={proj.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {proj.serviceCategory}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {proj.tasks?.length || 0} tasks
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{proj.name}</h4>
              <p className="text-xs text-slate-500">{proj.client?.businessName || "Internal Agency Project"}</p>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
                <span>Owner: {proj.owner?.name || "Aarav Sharma"}</span>
                <span>Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Board */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Task Board & Deliverables
        </h3>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-xs text-slate-400">
            No active tasks. Click &quot;Create Task&quot; to assign tasks to designers, copywriters, or media buyers.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["NOT_STARTED", "IN_PROGRESS", "COMPLETED"].map((colStatus) => {
              const colTasks = tasks.filter((t) =>
                colStatus === "COMPLETED" ? t.status === "COMPLETED" : colStatus === "IN_PROGRESS" ? ["IN_PROGRESS", "WAITING_REVIEW"].includes(t.status) : t.status === "NOT_STARTED"
              );

              return (
                <div key={colStatus} className="bg-slate-100/70 p-3.5 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between font-bold text-xs text-slate-800">
                    <span>{colStatus.replace(/_/g, " ")}</span>
                    <span className="bg-white px-2 py-0.5 rounded-full text-[10px] text-slate-600 border border-slate-200">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {colTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5 hover:border-blue-400 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            t.priority === "URGENT" ? "bg-red-100 text-red-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {t.priority}
                          </span>
                          <span className="text-[10px] font-bold text-slate-600">{t.completionPercentage}%</span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-xs leading-snug">{t.title}</h4>
                        {t.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2">{t.description}</p>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-700">{t.assignedTo?.name || "Unassigned"}</span>
                          <span>Due: {formatDateIST(t.dueDate)}</span>
                        </div>

                        {/* Status switcher */}
                        <div className="pt-1 flex justify-end gap-1">
                          {t.status !== "IN_PROGRESS" && t.status !== "COMPLETED" && (
                            <button
                              onClick={() => handleUpdateTaskStatus(t.id, "IN_PROGRESS")}
                              className="text-[10px] text-blue-600 hover:underline font-semibold"
                            >
                              Start →
                            </button>
                          )}
                          {t.status !== "COMPLETED" && (
                            <button
                              onClick={() => handleUpdateTaskStatus(t.id, "COMPLETED")}
                              className="text-[10px] text-emerald-600 hover:underline font-semibold"
                            >
                              Complete ✓
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create New Project Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Design 4 Festive Feed Creatives"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Assign To Staff Member</label>
                <select
                  value={taskAssignedId}
                  onChange={(e) => setTaskAssignedId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Due Date *</label>
                  <input
                    type="datetime-local"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="URGENT">Urgent 🔥</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Brief / Description</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Include design dimensions, copy hooks, or campaign targeting instructions..."
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
