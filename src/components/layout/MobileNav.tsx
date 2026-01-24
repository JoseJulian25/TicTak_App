import { Clock, BarChart3, Folder, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function MobileNav({ activeView, onViewChange }: MobileNavProps) {
  const menuItems = [
    { id: "timer", label: "Temporizador", icon: Clock },
    { id: "stats", label: "Estadísticas", icon: BarChart3 },
    { id: "projects", label: "Proyectos", icon: Folder },
  ];

  return (
    <>
      {/* Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          {/* Logo and Name - Left */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-white"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              TicTak
            </h1>
          </div>

          {/* User + Settings - Right */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewChange("settings")}
              className={`h-8 w-8 ${
                activeView === "settings"
                  ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <nav className="flex items-center justify-around p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <Button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                variant="ghost"
                size="icon"
                className={`h-14 w-14 rounded-xl flex flex-col items-center justify-center gap-1 ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                <Icon className="h-6 w-6" />
              </Button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
