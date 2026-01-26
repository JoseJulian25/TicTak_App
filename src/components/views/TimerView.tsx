"use client";

import { useState } from "react";
import { Play, Pause, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircularTimer } from "@/components/CircularTimer";
import { ProjectTreeSelector } from "@/components/ProjectTreeSelector";
import { SessionSummary } from "@/components/SessionSummary";
import { SessionHistory } from "@/components/SessionHistory";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTimerStore } from "@/stores/useTimerStore";
import { useTimerInterval } from "@/hooks/useTimerInterval";
import { saveActiveSession } from "@/lib/session-manager";
import { useTaskStore } from "@/stores/useTaskStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { UNNAMED_TASK_ID } from "@/lib/constants";
import { toast } from "sonner";

export function TimerView() {
  // Estados del timer desde el store
  const activeSession = useTimerStore((state) => state.activeSession);
  const startTimer = useTimerStore((state) => state.startTimer);
  const pauseTimer = useTimerStore((state) => state.pauseTimer);
  const resumeTimer = useTimerStore((state) => state.resumeTimer);
  
  const addTask = useTaskStore((state) => state.addTask);
  
  // Obtener proyecto "General" (buscar por nombre)
  const generalProject = useProjectStore((state) => 
    state.projects.find(p => p.name === "General" && !p.isArchived)
  );
  
  // Hook que maneja el interval automático
  const { elapsedSeconds, isRunning, isPaused } = useTimerInterval();
  
  // Estados locales de UI
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");

  /**
   * Manejar inicio/pausa/reanudación del timer
   */
  const handleStartPause = () => {

    if (isRunning) {
      pauseTimer();
      return;
    }

    if (isPaused && activeSession) {
      resumeTimer();
      return;
    }
  
    const taskIdToUse = selectedTaskId || UNNAMED_TASK_ID;
    startTimer(taskIdToUse);
  };


  const handleSave = () => {
    if (elapsedSeconds === 0) return;
    
    if (activeSession?.taskId === UNNAMED_TASK_ID) {
      setShowSaveDialog(true);
      pauseTimer(); 
      return;
    }
    
    // Guardar sesión con la tarea seleccionada
    const result = saveActiveSession();
    
    if (result.success) {
      toast.success('Sesión guardada correctamente', {
        description: `${Math.floor(result.session.duration / 60)} minutos registrados`,
      });

      setSelectedTaskId(null);
    } else {
      toast.error('Error al guardar', {
        description: result.error,
      });
    }
  };


  const handleSaveWithNewTask = () => {
    if (!newTaskName.trim()) return;
    
    try {
      if (!generalProject) {
        toast.error('Proyecto no encontrado', {
          description: 'No se encontró el proyecto "General". Por favor crea uno en Ajustes.',
        });
        return;
      }
      
      const newTask = addTask({
        name: newTaskName.trim(),
        projectId: generalProject.id,
      });
      
      // Actualizar el activeSession con el taskId real
      if (activeSession) {
        useTimerStore.setState((state) => ({
          ...state, activeSession: state.activeSession ? { ...state.activeSession, taskId: newTask.id } : state.activeSession,
        }));
      }
      
      // Guardar sesión con la tarea real
      const result = saveActiveSession();
      
      if (result.success) {
        toast.success('Tarea creada y sesión guardada', {
          description: `"${newTask.name}" - ${Math.floor(result.session.duration / 60)} minutos`,
        });
        
        // Resetear todo
        setShowSaveDialog(false);
        setNewTaskName('');
        setSelectedTaskId(null);
      } else {
        toast.error('Error al guardar', {
          description: result.error,
        });
      }
    } catch (error) {
        console.error('Error al crear tarea:', error);
        toast.error('Error al crear la tarea', {
          description: 'Ocurrió un problema al crear la nueva tarea. Intenta de nuevo.',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col items-center">
        {/* Project Tree Selector */}
        <div className="w-full max-w-md mb-8">
          <ProjectTreeSelector
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
          />
        </div>

        {/* Circular Timer */}
        <div className="my-6 md:my-8">
          <CircularTimer seconds={elapsedSeconds} isRunning={isRunning} />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 w-full max-w-md">
          <Button
            onClick={handleStartPause}
            size="lg"
            className={`flex-1 ${
              isRunning
                ? "bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pausar
              </>
            ) : isPaused ? (
              <>
                <Play className="h-5 w-5 mr-2" />
                Reanudar
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Iniciar
              </>
            )}
          </Button>
          <Button
            onClick={handleSave}
            size="lg"
            disabled={elapsedSeconds === 0}
            className={`flex-1 ${
              elapsedSeconds === 0 ? "opacity-50 cursor-not-allowed" : ""
            } bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700`}
          >
            <Save className="h-5 w-5 mr-2" />
            Guardar
          </Button>
        </div>

        {!selectedTaskId && (
          <div className="text-center mb-8 px-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              ¿No tienes una tarea específica? ¡No hay problema!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Puedes empezar a trackear y nombrar la tarea al guardar
            </p>
          </div>
        )}

        {selectedTaskId && activeSession && (
          <div className="text-center mb-8 px-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trackeando tarea seleccionada
            </p>
          </div>
        )}

        {/* Session Summary */}
        <div className="mb-8">
          <SessionSummary />
        </div>

        {/* Session History */}
        <SessionHistory />
      </div>

      {/* Save Dialog for unnamed tasks */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nombra tu tarea</DialogTitle>
            <DialogDescription>
              Guardando {Math.floor(elapsedSeconds / 60)} minutos de trabajo en Personal &gt; General
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-name">Nombre de la tarea</Label>
              <Input
                id="task-name"
                placeholder="Ej: Revisión de emails, Investigación..."
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTaskName.trim()) {
                    handleSaveWithNewTask();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowSaveDialog(false);
                setNewTaskName("");
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveWithNewTask}
              disabled={!newTaskName.trim()}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
