"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Clock, LogIn, CheckCircle2 } from "lucide-react";
import { GlobalSearchModal } from "./GlobalSearchModal";

interface HeaderProps {
  user: {
    id: string;
    name: string;
    role: string;
    employeeId: string;
  };
}

// Role badge colour map
const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  SALES_EXECUTIVE:    { label: "Sales",   cls: "bg-blue-100 text-blue-700" },
  GRAPHIC_DESIGNER:   { label: "Design",  cls: "bg-purple-100 text-purple-700" },
  SOCIAL_MEDIA_MANAGER:{ label: "SMM",   cls: "bg-pink-100 text-pink-700" },
  META_ADS_MANAGER:   { label: "Ads",    cls: "bg-emerald-100 text-emerald-700" },
  SUPER_ADMIN:        { label: "Admin",  cls: "bg-red-100 text-red-700" },
  CUSTOM:             { label: "Custom", cls: "bg-slate-100 text-slate-700" },
};

export function Header({ user }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [attendance, setAttendance] = useState<any>(null);
  const [checkingAttendance, setCheckingAttendance] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
    fetchAttendance();
    if (user.role === "SUPER_ADMIN") fetchStaff();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Also run the reminder check runner!
      await fetch("/api/reminders/check", { method: "POST" });
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/attendance");
      const data = await res.json();
      setAttendance(data.myTodayRecord);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAttendanceAction = async (action: "check_in" | "check_out") => {
    setCheckingAttendance(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setAttendance(data.attendance);
      } else {
        alert(data.error || "Attendance action failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setCheckingAttendance(false);
    }
  };

  const markAllNotifsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch real staff from database
  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      // Exclude current admin from the list
      const others = (data.employees || []).filter((e: any) => e.id !== user.id);
      setStaffList(others);
    } catch (e) {
      console.error(e);
    }
  };

  // Impersonate staff member
  const switchAccount = async (employeeId: string) => {
    try {
      const res = await fetch("/api/auth/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: employeeId }),
      });
      if (res.ok) {
        setRoleSwitcherOpen(false);
        window.location.reload();
      } else {
        alert("Could not switch account. Please try again.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        {/* Search Bar Button */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-400 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-white transition shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Search size={16} className="text-slate-400" />
              <span>Search leads, clients, campaigns...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-200 text-slate-600 rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Asia/Kolkata Timezone Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-md border border-slate-200">
            <Clock size={13} className="text-blue-600" />
            <span>Asia/Kolkata (IST)</span>
          </div>

          {/* Attendance Check-in Widget */}
          <div className="flex items-center">
            {!attendance?.checkInTime ? (
              <button
                onClick={() => handleAttendanceAction("check_in")}
                disabled={checkingAttendance}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
              >
                <CheckCircle2 size={14} />
                <span>Check In</span>
              </button>
            ) : !attendance?.checkOutTime ? (
              <button
                onClick={() => handleAttendanceAction("check_out")}
                disabled={checkingAttendance}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
              >
                <Clock size={14} />
                <span>Check Out ({attendance.totalHours || "Active"})</span>
              </button>
            ) : (
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                Checked Out ({attendance.totalHours}h)
              </span>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.2 rounded-full font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotifsRead}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-8">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition ${
                          !n.isRead ? "bg-blue-50/40" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900">{n.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(n.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Impersonate Staff / Demo Role Switcher - STRICTLY RESTRICTED TO SUPER_ADMIN ONLY */}
          {user.role === "SUPER_ADMIN" && (
            <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition"
                title="Super Admin Impersonation: View dashboard from staff perspective"
              >
                <LogIn size={13} className="text-blue-600" />
                <span className="hidden sm:inline">View As Staff</span>
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 flex items-center justify-between border-b border-slate-100 pb-1 mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Staff Impersonation Mode
                    </p>
                    <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1 rounded">Admin Only</span>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {staffList.length === 0 ? (
                      <p className="text-center text-[11px] text-slate-400 py-4">
                        No other staff members yet.
                      </p>
                    ) : (
                      staffList.map((emp) => {
                        const badge = ROLE_BADGE[emp.role] || ROLE_BADGE.CUSTOM;
                        return (
                          <button
                            key={emp.id}
                            onClick={() => switchAccount(emp.id)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-blue-50 hover:text-blue-700 transition flex items-center justify-between"
                          >
                            <div>
                              <p className="font-semibold text-slate-800">{emp.name}</p>
                              <p className="text-[10px] text-slate-500">{emp.designation}</p>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
