"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users2,
  PhoneCall,
  CalendarDays,
  Target,
  Briefcase,
  CheckSquare,
  UserCheck,
  Clock,
  CircleDollarSign,
  Receipt,
  FileSpreadsheet,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

interface SidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    employeeId: string;
    department: string;
  };
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ user, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (onMobileClose) onMobileClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const isAdmin = user.role === "SUPER_ADMIN";
  const isSales = user.role === "SALES_EXECUTIVE";
  const isDesigner = user.role === "GRAPHIC_DESIGNER";
  const isSMM = user.role === "SOCIAL_MEDIA_MANAGER";
  const isMediaBuyer = user.role === "META_ADS_MANAGER";

  const navigation = isAdmin
    ? [
        {
          group: "CORE",
          items: [
            { name: "Executive Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "Leads CRM", href: "/leads", icon: Users2 },
            { name: "Follow-ups", href: "/follow-ups", icon: PhoneCall },
            { name: "Content Calendar", href: "/content-calendar", icon: CalendarDays },
          ],
        },
        {
          group: "MARKETING",
          items: [
            { name: "Internal Meta Ads", href: "/campaigns", icon: Target },
            { name: "Clients & Workspaces", href: "/clients", icon: Briefcase },
            { name: "Projects & Tasks", href: "/projects", icon: CheckSquare },
          ],
        },
        {
          group: "AGENCY OPS",
          items: [
            { name: "Employee Directory", href: "/employees", icon: UserCheck },
            { name: "Attendance Log", href: "/attendance", icon: Clock },
            { name: "Payroll & Salaries", href: "/payroll", icon: CircleDollarSign },
            { name: "Finance & Invoices", href: "/finance", icon: Receipt },
          ],
        },
        {
          group: "TOOLS & ADMIN",
          items: [
            { name: "Import & Export", href: "/import-export", icon: FileSpreadsheet },
            { name: "Agency Reports", href: "/reports", icon: BarChart3 },
            { name: "Admin Settings", href: "/settings", icon: Settings },
          ],
        },
      ]
    : isSales
    ? [
        {
          group: "SALES WORKSPACE",
          items: [
            { name: "Sales Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "My Leads Pipeline", href: "/leads", icon: Users2 },
            { name: "Scheduled Calls", href: "/follow-ups", icon: PhoneCall },
            { name: "Assigned Tasks", href: "/projects", icon: CheckSquare },
          ],
        },
        {
          group: "DAILY OPS",
          items: [
            { name: "My Attendance", href: "/attendance", icon: Clock },
          ],
        },
      ]
    : isDesigner
    ? [
        {
          group: "CREATIVE WORKSPACE",
          items: [
            { name: "Creative Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "Design Projects", href: "/projects", icon: CheckSquare },
            { name: "Content Calendar", href: "/content-calendar", icon: CalendarDays },
            { name: "Client Workspaces", href: "/clients", icon: Briefcase },
          ],
        },
        {
          group: "DAILY OPS",
          items: [
            { name: "My Attendance", href: "/attendance", icon: Clock },
          ],
        },
      ]
    : isSMM
    ? [
        {
          group: "SOCIAL MEDIA WORKSPACE",
          items: [
            { name: "SMM Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "Content Calendar", href: "/content-calendar", icon: CalendarDays },
            { name: "Client Accounts", href: "/clients", icon: Briefcase },
            { name: "Social Tasks", href: "/projects", icon: CheckSquare },
          ],
        },
        {
          group: "DAILY OPS",
          items: [
            { name: "My Attendance", href: "/attendance", icon: Clock },
          ],
        },
      ]
    : isMediaBuyer
    ? [
        {
          group: "ADS WORKSPACE",
          items: [
            { name: "Ads Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "Internal Meta Ads", href: "/campaigns", icon: Target },
            { name: "Ad Leads CRM", href: "/leads", icon: Users2 },
            { name: "Client Ad Accounts", href: "/clients", icon: Briefcase },
            { name: "Ad Tasks", href: "/projects", icon: CheckSquare },
          ],
        },
        {
          group: "DAILY OPS",
          items: [
            { name: "My Attendance", href: "/attendance", icon: Clock },
          ],
        },
      ]
    : [
        {
          group: "WORKSPACE",
          items: [
            { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "Projects & Tasks", href: "/projects", icon: CheckSquare },
            { name: "My Attendance", href: "/attendance", icon: Clock },
          ],
        },
      ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded">Owner</span>;
      case "SALES_EXECUTIVE":
        return <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded">Sales</span>;
      case "GRAPHIC_DESIGNER":
        return <span className="text-[10px] bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded">Design</span>;
      case "SOCIAL_MEDIA_MANAGER":
        return <span className="text-[10px] bg-pink-100 text-pink-700 font-semibold px-2 py-0.5 rounded">SMM</span>;
      case "META_ADS_MANAGER":
        return <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded">Ads</span>;
      default:
        return <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">{role}</span>;
    }
  };

  const sidebarContent = (
    <aside
      className={`h-full flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-950 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-lg">
              A
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-base text-white tracking-tight leading-none">
                ARVIAN
              </h1>
              <span className="text-[11px] text-blue-400 font-medium tracking-wider uppercase">
                Agency CRM
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 mx-auto rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg text-lg">
            A
          </div>
        )}

        {/* Mobile: close button | Desktop: collapse button */}
        <div className="flex items-center gap-1">
          {/* Mobile close */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
              title="Close menu"
            >
              <X size={18} />
            </button>
          )}
          {/* Desktop collapse */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigation.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                {group.group}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* User Card & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 shrink-0">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-blue-400 border border-slate-700 flex items-center justify-center font-semibold text-xs shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {getRoleBadge(user.role)}
                  <span className="text-[10px] text-slate-400 font-mono">{user.employeeId}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 p-1.5 rounded-md hover:bg-slate-800 transition"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-blue-400 border border-slate-700 flex items-center justify-center font-semibold text-xs">
              {user.name.charAt(0)}
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 p-1 rounded hover:bg-slate-800"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar - always visible on lg+ */}
      <div className={`hidden lg:flex flex-col fixed top-0 left-0 z-30 h-screen transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
        {sidebarContent}
      </div>

      {/* Mobile Sidebar - drawer overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-slate-900/70 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <div className="lg:hidden fixed top-0 left-0 z-50 h-screen w-72 shadow-2xl">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
