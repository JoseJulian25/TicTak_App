"use client";

import { Bell, Moon, Globe, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function SettingsView() {
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Modo Oscuro
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Activa el tema oscuro
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Recordatorios de descanso
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Recibe notificaciones cada hora
                </div>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Resumen diario
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Resumen al final del día
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Idioma y Región
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Idioma
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Español
                </div>
              </div>
              <Button variant="outline" size="sm">
                Cambiar
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Formato de hora
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  24 horas
                </div>
              </div>
              <Button variant="outline" size="sm">
                Cambiar
              </Button>
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Download className="h-5 w-5" />
            Datos
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Exportar datos
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Descarga todos tus datos en formato CSV
                </div>
              </div>
              <Button variant="outline" size="sm">
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
