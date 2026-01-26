import { useState } from "react";
import { useTimerStore } from "@/stores/useTimerStore";
import { useTimerInterval } from "@/hooks/useTimerInterval";
import { useTaskStore } from "@/stores/useTaskStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { saveActiveSession } from "@/lib/session-manager";
import { UNNAMED_TASK_ID } from "@/lib/constants";
import { toast } from "sonner";

export function useTimerActions() {
  const activeSession = useTimerStore((state) => state.activeSession);
  const startTimer = useTimerStore((state) => state.startTimer);
  const pauseTimer = useTimerStore((state) => state.pauseTimer);
  const resumeTimer = useTimerStore((state) => state.resumeTimer);
  const resetTimer = useTimerStore((state) => state.resetTimer);
  
  const addTask = useTaskStore((state) => state.addTask);
  
  const generalProject = useProjectStore((state) => 
    state.projects.find(p => p.name === "General" && !p.isArchived)
  );
  
  const { elapsedSeconds, isRunning, isPaused } = useTimerInterval();
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");

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
      
      if (activeSession) {
        useTimerStore.setState((state) => ({
          ...state, 
          activeSession: state.activeSession 
            ? { ...state.activeSession, taskId: newTask.id } 
            : state.activeSession,
        }));
      }
      
      const result = saveActiveSession();
      
      if (result.success) {
        toast.success('Tarea creada y sesión guardada', {
          description: `"${newTask.name}" - ${Math.floor(result.session.duration / 60)} minutos`,
        });
        
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

  const handleCancelSave = () => {
    setShowSaveDialog(false);
    setNewTaskName("");
  };

  const handleReset = () => {
    if (elapsedSeconds === 0 && !activeSession) return;
    
    resetTimer();
    setSelectedTaskId(null);
    
    toast.info('Sesión descartada', {
      description: 'El timer ha sido reiniciado',
    });
  };

  return {
    // State
    selectedTaskId,
    setSelectedTaskId,
    showSaveDialog,
    setShowSaveDialog,
    newTaskName,
    setNewTaskName,
    elapsedSeconds,
    isRunning,
    isPaused,
    activeSession,
    
    // Actions
    handleStartPause,
    handleSave,
    handleSaveWithNewTask,
    handleCancelSave,
    handleReset,
  };
}
