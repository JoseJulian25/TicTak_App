"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveView = () => {
    if (pathname.includes("/stats")) return "stats";
    if (pathname.includes("/projects")) return "projects";
    if (pathname.includes("/settings")) return "settings";
    return "timer";
  };

  const handleViewChange = (view: string) => {
    const routes: Record<string, string> = {
      timer: "/dashboard/timer",
      stats: "/dashboard/stats",
      projects: "/dashboard/projects",
      settings: "/dashboard/settings",
    };
    router.push(routes[view]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar for desktop */}
        <Sidebar activeView={getActiveView()} onViewChange={handleViewChange} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto md:pt-0 pt-16 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile navigation */}
      <MobileNav activeView={getActiveView()} onViewChange={handleViewChange} />
    </div>
  );
}