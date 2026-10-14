"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppLayoutClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    employeeId: string;
    department: string;
  };
  children: React.ReactNode;
}

export function AppLayoutClient({ user, children }: AppLayoutClientProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar navigation */}
      <Sidebar
        user={user}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area
          On desktop (lg+): offset by sidebar width (64 = 16rem).
          On mobile: full width (sidebar is hidden in a drawer overlay). */}
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <Header
          user={user}
          onMobileMenuToggle={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
