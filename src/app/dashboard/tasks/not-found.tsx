import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Página Not Found para tareas
 * 
 * Se muestra cuando se intenta acceder a una tarea que no existe
 * o fue eliminada del sistema.
 */
export default function TaskNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        {/* Icono */}
        <SearchX className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
        
        {/* Título */}
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Tarea no encontrada
        </h1>
        
        {/* Descripción */}
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          La tarea que buscas no existe o fue eliminada del sistema.
        </p>
        
        {/* Botón de acción */}
        <Link href="/dashboard/projects">
          <Button size="lg" className="gap-2">
            Volver a Proyectos
          </Button>
        </Link>
      </div>
    </div>
  );
}
