import { useState } from "react";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Task } from "@/types/entities";

interface TaskHeaderProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  onStartTimer: () => void;
}

/**
 * Header de tarea con título y descripción editables inline
 * 
 * Permite editar el nombre y descripción haciendo click,
 * toggle de completado con switch, y botón para iniciar timer.
 */
export function TaskHeader({ task, onUpdate, onStartTimer }: TaskHeaderProps) {
  // Estados de edición
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState(task.name);
  const [description, setDescription] = useState(task.description || "");

  /**
   * Guarda el título editado
   */
  const handleSaveTitle = () => {
    const trimmedTitle = title.trim();
    
    if (!trimmedTitle) {
      toast.error("El nombre no puede estar vacío");
      setTitle(task.name);
      setIsEditingTitle(false);
      return;
    }

    // Solo actualizar si cambió
    if (trimmedTitle !== task.name) {
      onUpdate({ name: trimmedTitle });
      toast.success("Nombre actualizado");
    }
    
    setIsEditingTitle(false);
  };

  /**
   * Guarda la descripción editada
   */
  const handleSaveDescription = () => {
    const trimmedDescription = description.trim();
    
    if (trimmedDescription !== (task.description || "")) {
      onUpdate({ description: trimmedDescription });
      toast.success("Descripción actualizada");
    }
    
    setIsEditingDescription(false);
  };

  /**
   * Alterna el estado de completado
   */
  const handleToggleComplete = (checked: boolean) => {
    onUpdate({ isCompleted: checked });
    toast.success(checked ? "Tarea completada" : "Tarea marcada como pendiente");
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-8 shadow-sm">
      {/* Título y Switch de completado */}
      <div className="flex items-start justify-between gap-4 mb-4">
        {isEditingTitle ? (
          <Input
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                handleSaveTitle();
              }
              if (e.key === "Escape") {
                setTitle(task.name);
                setIsEditingTitle(false);
              }
            }}
            className="text-3xl font-semibold border-blue-500 dark:border-blue-400"
            autoFocus
          />
        ) : (
          <h1
            onClick={() => {
              setTitle(task.name);
              setIsEditingTitle(true);
            }}
            className="text-3xl font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {task.name}
          </h1>
        )}
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-gray-600 dark:text-gray-400">Completada</span>
          <Switch 
            checked={task.isCompleted} 
            onCheckedChange={handleToggleComplete}
            disabled={isEditingTitle || isEditingDescription}
          />
        </div>
      </div>

      {/* Descripción editable */}
      {isEditingDescription ? (
        <Textarea
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          onBlur={handleSaveDescription}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Escape") {
              setDescription(task.description || "");
              setIsEditingDescription(false);
            }
          }}
          className="mb-6 min-h-[80px] border-blue-500 dark:border-blue-400"
          autoFocus
        />
      ) : (
        <p
          onClick={() => {
            setDescription(task.description || "");
            setIsEditingDescription(true);
          }}
          className={`mb-6 text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors ${
            !task.description && "italic"
          }`}
        >
          {task.description || "Agregar descripción..."}
        </p>
      )}

      {/* Botón de iniciar timer */}
      <Button
        onClick={onStartTimer}
        disabled={task.isCompleted}
        className="bg-green-500 hover:bg-green-600 text-white h-10 px-6 gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Play className="h-5 w-5" />
        Iniciar Timer
      </Button>
    </div>
  );
}
