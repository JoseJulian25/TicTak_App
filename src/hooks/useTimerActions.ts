import { useState, useEffect } from "react";
import { useTimerStore } from "@/stores/useTimerStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { saveActiveSession } from "@/lib/session-manager";
import { UNNAMED_TASK_ID, LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { Storage } from "@/lib/storage";
import { toast } from "sonner";

export function useTimerActions() {
  const activeSession = useTimerStore((state) => state.activeSession);
  const elapsedSeconds = useTimerStore((state) => state.elapsedSeconds);
  const isRunning = useTimerStore((state) => state.isRunning);
  const isPaused = useTimerStore((state) => state.isPaused);
  const startTimer = useTimerStore((state) => state.startTimer);
  const pauseTimer = useTimerStore((state) => state.pauseTimer);
  const resumeTimer = useTimerStore((state) => state.resumeTimer);
  const resetTimer = useTimerStore((state) => state.resetTimer);
  
  const addTask = useTaskStore((state) => state.addTask);
  
  const generalProject = useProjectStore((state) => 
    state.projects.find(p => p.name === "General" && !p.isArchived)
  );
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");

  // Efecto para actualizar el taskId de la sesión activa cuando se selecciona una tarea
  useEffect(() => {
    if (selectedTaskId && activeSession) {
      // Solo actualizar si es diferente
      if (activeSession.taskId !== selectedTaskId) {
        const updatedSession = {
          ...activeSession,
          taskId: selectedTaskId,
        };
        
        useTimerStore.setState({ activeSession: updatedSession });
        
        Storage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_SESSION, {
          session: updatedSession,
          elapsedSeconds,
        });
        
        // Feedback al usuario
        const wasUnnamed = activeSession.taskId === UNNAMED_TASK_ID;
        if (wasUnnamed) {
          toast.success('Tarea asignada', {
            description: 'La sesión ahora está asociada a una tarea',
          });
        } else {
          toast.info('Tarea cambiada', {
            description: 'La sesión se reasignó a otra tarea',
          });
        }
      }
    }
  }, [selectedTaskId, activeSession, elapsedSeconds]);

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
          activeSession: state.activeSession ? { ...state.activeSession, taskId: newTask.id } : state.activeSession,
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
    
    // Si hay más de 5 minutos (300 segundos), pedir confirmación
    if (elapsedSeconds >= 300) {
      setShowResetDialog(true);
      return;
    }
    
    resetTimer();
  };
  
  const confirmReset = () => {
    resetTimer();
    setShowResetDialog(false);
  };

  return {
    // State
    selectedTaskId,
    setSelectedTaskId,
    showSaveDialog,
    setShowSaveDialog,
    showResetDialog,
    setShowResetDialog,
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
    confirmReset,
  };
}
