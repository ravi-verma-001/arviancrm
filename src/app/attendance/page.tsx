"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  Calendar,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { formatDateTimeIST } from "@/lib/utils";

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("2026-10-12");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?date=${selectedDate}`);
      const data = await res.json();
      setAttendances(data.attendances || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Present</span>;
      case "WFH":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Work From Home</span>;
      case "LATE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Late Arrival</span>;
      case "ABSENT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">Absent</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="text-blue-600" />
            Staff Attendance & Daily Working Hours
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified check-in / check-out records in Asia/Kolkata timezone
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="p-3">Staff ID</th>
              <th className="p-3">Employee Name</th>
              <th className="p-3">Department</th>
              <th className="p-3">Check-in Time (IST)</th>
              <th className="p-3">Check-out Time (IST)</th>
              <th className="p-3 text-center">Total Working Hours</th>
              <th className="p-3">Attendance Status</th>
              <th className="p-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">Loading attendance logs...</td>
              </tr>
            ) : attendances.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">No attendance entries recorded for this date.</td>
              </tr>
            ) : (
              attendances.map((att) => (
                <tr key={att.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-400">{att.user?.employeeId}</td>
                  <td className="p-3 font-bold text-slate-900">{att.user?.name}</td>
                  <td className="p-3 text-slate-600">{att.user?.department}</td>
                  <td className="p-3 font-mono text-slate-800">
                    {att.checkInTime ? formatDateTimeIST(att.checkInTime) : "—"}
                  </td>
                  <td className="p-3 font-mono text-slate-800">
                    {att.checkOutTime ? formatDateTimeIST(att.checkOutTime) : "Active"}
                  </td>
                  <td className="p-3 text-center font-bold text-slate-900">
                    {att.totalHours > 0 ? `${att.totalHours} hrs` : "In Progress"}
                  </td>
                  <td className="p-3">{getStatusBadge(att.status)}</td>
                  <td className="p-3 text-slate-500 italic max-w-xs truncate">{att.notes || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
