"use client";

import { Play, Pause, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircularTimer } from "@/components/CircularTimer";
import { ProjectTreeSelector } from "@/components/ProjectTreeSelector";
import { SessionSummary } from "@/components/SessionSummary";
import { SessionHistory } from "@/components/SessionHistory";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTimerActions } from "@/hooks/useTimerActions";

export function TimerView() {
  const {
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
    handleStartPause,
    handleSave,
    handleSaveWithNewTask,
    handleCancelSave,
    handleReset,
  } = useTimerActions();

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
        <div className="w-full max-w-md mb-8 pl-20">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
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
          <Button
            onClick={handleReset}
            size="lg"
            disabled={elapsedSeconds === 0 && !activeSession}
            variant="outline"
            className="sm:w-auto"
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
              onClick={handleCancelSave}
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
