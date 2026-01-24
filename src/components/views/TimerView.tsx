"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircularTimer } from "@/components/CircularTimer";
import { ProjectTreeSelector, ProjectNode } from "@/components/ProjectTreeSelector";
import { SessionSummary } from "@/components/SessionSummary";
import { SessionHistory } from "@/components/SessionHistory";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Session {
  id: string;
  projectName: string;
  projectPath: string;
  duration: number;
  startTime: Date;
  endTime: Date;
}

export function TimerView() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedNode, setSelectedNode] = useState<ProjectNode | null>(null);
  const [totalTimeToday, setTotalTimeToday] = useState(9270); // 2h 34m 30s de ejemplo
  const [sessionCount, setSessionCount] = useState(3);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");

  // Estructura jerárquica de ejemplo con Personal > General por defecto
  const projectHierarchy: ProjectNode[] = [
    {
      id: "personal",
      name: "Personal",
      type: "client",
      children: [
        {
          id: "personal-general",
          name: "General",
          type: "project",
          parentId: "personal",
          children: [],
        },
      ],
    },
    {
      id: "1",
      name: "BanReservas",
      type: "client",
      children: [
        {
          id: "1-1",
          name: "Sistema de Pagos",
          type: "project",
          parentId: "1",
          children: [
            {
              id: "1-1-1",
              name: "Implementar API de transacciones",
              type: "subtask",
              parentId: "1-1",
            },
            {
              id: "1-1-2",
              name: "Diseñar UI de pagos",
              type: "subtask",
              parentId: "1-1",
            },
            {
              id: "1-1-3",
              name: "Pruebas de integración",
              type: "subtask",
              parentId: "1-1",
            },
          ],
        },
        {
          id: "1-2",
          name: "App Móvil",
          type: "project",
          parentId: "1",
          children: [
            {
              id: "1-2-1",
              name: "Login y autenticación",
              type: "subtask",
              parentId: "1-2",
            },
            {
              id: "1-2-2",
              name: "Dashboard principal",
              type: "subtask",
              parentId: "1-2",
            },
          ],
        },
      ],
    },
    {
      id: "2",
      name: "Tech Corp",
      type: "client",
      children: [
        {
          id: "2-1",
          name: "Website Redesign",
          type: "project",
          parentId: "2",
          children: [
            {
              id: "2-1-1",
              name: "Wireframes y mockups",
              type: "subtask",
              parentId: "2-1",
            },
            {
              id: "2-1-2",
              name: "Desarrollo frontend",
              type: "subtask",
              parentId: "2-1",
            },
          ],
        },
      ],
    },
    {
      id: "3",
      name: "Freelance",
      type: "client",
      children: [
        {
          id: "3-1",
          name: "Landing Page Cliente X",
          type: "project",
          parentId: "3",
          children: [
            {
              id: "3-1-1",
              name: "Diseño responsive",
              type: "subtask",
              parentId: "3-1",
            },
            {
              id: "3-1-2",
              name: "Optimización SEO",
              type: "subtask",
              parentId: "3-1",
            },
          ],
        },
      ],
    },
  ];

  // Sesiones de ejemplo con jerarquía completa
  const sessions: Session[] = [
    {
      id: "1",
      projectName: "Implementar API de transacciones",
      projectPath: "BanReservas > Sistema de Pagos > Implementar API de transacciones",
      duration: 5430, // 1h 30m 30s
      startTime: new Date(2026, 0, 19, 9, 0),
      endTime: new Date(2026, 0, 19, 10, 30),
    },
    {
      id: "2",
      projectName: "Wireframes y mockups",
      projectPath: "Tech Corp > Website Redesign > Wireframes y mockups",
      duration: 2700, // 45m
      startTime: new Date(2026, 0, 19, 11, 0),
      endTime: new Date(2026, 0, 19, 11, 45),
    },
    {
      id: "3",
      projectName: "Diseño responsive",
      projectPath: "Freelance > Landing Page Cliente X > Diseño responsive",
      duration: 1140, // 19m
      startTime: new Date(2026, 0, 19, 14, 15),
      endTime: new Date(2026, 0, 19, 14, 34),
    },
  ];

  // Timer effect
  useEffect(() => {
    let interval: number | undefined;

    if (isRunning) {
      interval = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleSave = () => {
    if (seconds === 0) return;
    
    // Si no hay tarea seleccionada, mostrar diálogo para nombrar la tarea
    if (!selectedNode) {
      setShowSaveDialog(true);
      setIsRunning(false); // Pausar el timer mientras nombra la tarea
      return;
    }
    
    // Guardar sesión con la tarea seleccionada
    console.log("Guardando sesión:", {
      task: selectedNode?.name,
      duration: seconds,
    });
    
    // Resetear el timer
    setSeconds(0);
    setIsRunning(false);
  };

  const handleSaveWithNewTask = () => {
    if (!newTaskName.trim()) return;
    
    // Guardar sesión con la nueva tarea bajo Personal > General
    console.log("Guardando sesión con nueva tarea:", {
      client: "Personal",
      project: "General",
      task: newTaskName,
      duration: seconds,
    });
    
    // Resetear todo
    setSeconds(0);
    setIsRunning(false);
    setShowSaveDialog(false);
    setNewTaskName("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col items-center">
        {/* Project Tree Selector */}
        <div className="w-full max-w-md mb-8">
          <ProjectTreeSelector
            projects={projectHierarchy}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
          />
        </div>

        {/* Circular Timer */}
        <div className="my-6 md:my-8">
          <CircularTimer seconds={seconds} isRunning={isRunning} />
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
            disabled={seconds === 0}
            className={`flex-1 ${
              seconds === 0 ? "opacity-50 cursor-not-allowed" : ""
            } bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700`}
          >
            <Save className="h-5 w-5 mr-2" />
            Guardar
          </Button>
        </div>

        {!selectedNode && (
          <div className="text-center mb-8 px-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              ¿No tienes una tarea específica? ¡No hay problema!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Puedes empezar a trackear y nombrar la tarea al guardar
            </p>
          </div>
        )}

        {selectedNode && (
          <div className="text-center mb-8 px-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trackeando: <span className="font-medium text-gray-900 dark:text-gray-100">{selectedNode.name}</span>
            </p>
          </div>
        )}

        {/* Session Summary */}
        <div className="mb-8">
          <SessionSummary totalTime={totalTimeToday} sessionCount={sessionCount} />
        </div>

        {/* Session History */}
        <SessionHistory sessions={sessions} />
      </div>

      {/* Save Dialog for unnamed tasks */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nombra tu tarea</DialogTitle>
            <DialogDescription>
              Guardando {Math.floor(seconds / 60)} minutos de trabajo en Personal &gt; General
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
