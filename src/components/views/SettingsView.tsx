"use client";

import { Bell, Moon, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Personaliza tu experiencia
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Apariencia
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Modo Oscuro
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Activa el tema oscuro
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </h2>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <Clock className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Recordatorios periódicos
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Notificaciones automáticas cada X minutos mientras el timer corre
                </div>
              </div>
            </div>

            <span className="shrink-0 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap">
              Próximamente
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
