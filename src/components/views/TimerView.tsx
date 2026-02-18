"use client";

import { useState, useMemo } from "react";
import { Play, Pause, Save, RotateCcw, ChevronDown, ChevronRight, FolderKanban, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircularTimer } from "@/components/CircularTimer";
import { ProjectTreeSelector } from "@/components/ProjectTreeSelector";
import { SessionSummary } from "@/components/SessionSummary";
import { SessionHistory } from "@/components/SessionHistory";
import { RecoveryDecisionModal } from "@/components/RecoveryDecisionModal";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTimerActions } from "@/hooks/useTimerActions";
import { useTimerStore } from "@/stores/useTimerStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { useClientStore } from "@/stores/useClientStore";
import { formatDuration } from "@/lib/time-utils";

export function TimerView() {
  const {
    selectedTaskId,
    setSelectedTaskId,
    showSaveDialog,
    setShowSaveDialog,
    showResetDialog,
    setShowResetDialog,
    newTaskName,
    setNewTaskName,
    selectedProjectId,
    setSelectedProjectId,
    elapsedSeconds,
    isRunning,
    isPaused,
    activeSession,
    handleStartPause,
    handleSave,
    handleSaveWithNewTask,
    handleCancelSave,
    handleReset,
    confirmReset,
  } = useTimerActions();

  // Estado local para el selector de proyectos en línea dentro del cuadro de diálogo de guardar
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");

  const allProjects = useProjectStore((state) => state.projects);
  const allClients = useClientStore((state) => state.clients);

  const projects = useMemo(() => allProjects.filter((p) => !p.isArchived), [allProjects]);
  const clients = useMemo(() => allClients.filter((c) => !c.isArchived), [allClients]);

  // Agrupar proyectos por cliente, filtrados por búsqueda
  const groupedProjects = useMemo(() => {
    const query = projectSearch.toLowerCase();
    return clients
      .map((client) => ({
        clientId: client.id,
        clientName: client.name,
        projects: projects.filter(
          (p) =>
            p.clientId === client.id &&
            (query === "" ||
              p.name.toLowerCase().includes(query) ||
              client.name.toLowerCase().includes(query))
        ),
      }))
      .filter((g) => g.projects.length > 0);
  }, [clients, projects, projectSearch]);

  const selectedProjectName = useMemo(() => {
    if (!selectedProjectId) return null;
    const project = projects.find((p) => p.id === selectedProjectId);
    if (!project) return null;
    const client = clients.find((c) => c.id === project.clientId);
    return client ? `${client.name} > ${project.name}` : project.name;
  }, [selectedProjectId, projects, clients]);

  // Estado del modal de recuperación
  const needsRecoveryDecision = useTimerStore((state) => state.needsRecoveryDecision);
  const pendingRecoveryData = useTimerStore((state) => state.pendingRecoveryData);
  const applyRecoveryDecision = useTimerStore((state) => state.applyRecoveryDecision);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-300">
      {/* Modal de Recuperación de Sesión */}
      {needsRecoveryDecision && pendingRecoveryData && (
        <RecoveryDecisionModal
          isOpen={needsRecoveryDecision}
          timeUntilClose={pendingRecoveryData.timeUntilClose}
          timeTotal={pendingRecoveryData.timeTotal}
          onDecision={applyRecoveryDecision}
        />
      )}

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
        <div className="w-full max-w-md mb-8 md:pl-20">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Button
              onClick={handleStartPause}
              size="lg"
            className={`flex-1 py-3 cursor-pointer ${
              isRunning
                ? "bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                : " bg-[#57cc99] hover:bg-[#80ed99] hover:bg-[#38a3a5]"
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
            className={`flex-1 py-3 cursor-pointer ${
              elapsedSeconds === 0 ? "opacity-50 cursor-not-allowed" : "text-white"
            } bg-[#0466c8] hover:bg-[#023e7d]`}
          >
            <Save className="h-5 w-5 mr-2" />
            Guardar
          </Button>
          <Button
            onClick={handleReset}
            size="lg"
            disabled={elapsedSeconds === 0 && !activeSession}
            variant="outline"
            className="sm:w-auto py-4 cursor-pointer"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          </div>
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
      <Dialog open={showSaveDialog} onOpenChange={(open) => {
        if (!open) {
          handleCancelSave();
          setShowProjectPicker(false);
          setProjectSearch("");
        }
        setShowSaveDialog(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nombra tu tarea</DialogTitle>
            <DialogDescription>
              {selectedProjectName
                ? `Se guardará en ${selectedProjectName}`
                : "Ponle nombre y elige el proyecto donde guardar la sesión"}
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
                    setShowProjectPicker(false);
                    setProjectSearch("");
                  }
                }}
                autoFocus
              />
            </div>

            {/* Inline project picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">
                  Proyecto <span className="text-destructive">*</span>
                </Label>
              </div>
              <button
                type="button"
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  selectedProjectName
                    ? "text-foreground hover:text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setShowProjectPicker(!showProjectPicker)}
              >
                {showProjectPicker
                  ? <ChevronDown className="h-3.5 w-3.5" />
                  : <ChevronRight className="h-3.5 w-3.5" />}
                {selectedProjectName ? (
                  <>
                    <FolderKanban className="h-3.5 w-3.5 text-purple-500" />
                    <span className="font-medium">{selectedProjectName}</span>
                  </>
                ) : (
                  "Selecciona un proyecto..."
                )}
              </button>

              {showProjectPicker && (
                <div className="border rounded-md overflow-hidden">
                  <div className="p-2 border-b">
                    <Input
                      placeholder="Buscar proyecto..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className="h-7 text-sm"
                    />
                  </div>
                  <ScrollArea className="h-40">
                    <div className="p-1">
                      {groupedProjects.map((group) => (
                        <div key={group.clientId}>
                          <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            <Building2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            {group.clientName}
                          </div>
                          {group.projects.map((project) => (
                            <button
                              key={project.id}
                              type="button"
                              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm text-left transition-colors ${
                                selectedProjectId === project.id
                                  ? "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
                              }`}
                              onClick={() => {
                                setSelectedProjectId(project.id);
                                setShowProjectPicker(false);
                                setProjectSearch("");
                              }}
                            >
                              <FolderKanban className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                              {project.name}
                            </button>
                          ))}
                        </div>
                      ))}
                      {groupedProjects.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-4">
                          No se encontraron proyectos
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                handleCancelSave();
                setShowProjectPicker(false);
                setProjectSearch("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                handleSaveWithNewTask();
                setShowProjectPicker(false);
                setProjectSearch("");
              }}
              disabled={!newTaskName.trim() || !selectedProjectId}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Descartar tiempo sin guardar?</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes {formatDuration(elapsedSeconds)} sin guardar. Si reinicias el temporizador,
              este tiempo se perderá permanentemente. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmReset}
              className="bg-red-500 hover:bg-red-600"
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
