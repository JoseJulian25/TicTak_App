"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { useTimerInterval } from "@/hooks/useTimerInterval";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  // Mantener el intervalo del timer activo globalmente
  useTimerInterval();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar for desktop */}
        <Sidebar/>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto md:pt-0 pt-16 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile navigation */}
      <MobileNav/>
    </div>
  );
}