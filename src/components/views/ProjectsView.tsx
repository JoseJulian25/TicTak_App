"use client";

import { useState, useEffect } from "react";
import { Plus, Clock, Building2, Search, X } from "lucide-react";
import { useProjectTreeForProjects } from "@/hooks/useProjectTreeForProjects";
import { useProjectsActions } from "@/hooks/useProjectsActions";
import { useProjectSearch } from "@/hooks/useProjectSearch";
import { useProjectDialogs } from "@/hooks/useProjectDialogs";
import { useProjectMove } from "@/hooks/useProjectMove";
import { useTaskStore } from "@/stores/useTaskStore";
import { formatDuration } from "@/lib/time-utils";
import { SkeletonProjects } from "@/components/skeletons/SkeletonProjects";
import { ProjectNodeItem } from "@/components/ProjectNodeItem";
import { MoveItemDialog } from "@/components/MoveItemDialog";
import { TreeNode } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export function ProjectsView() {
  const { tree, isLoading } = useProjectTreeForProjects(false);
  const { searchQuery, setSearchQuery, filteredProjects, matchingIds } = useProjectSearch(tree);
  const { updateTask } = useTaskStore();
  const {
    showDialog,
    setShowDialog,
    dialogType,
    selectedParentId,
    isEditMode,
    editingNodeId,
    editingNodeType,
    openAddDialog,
    openEditDialog,
    showDeleteDialog,
    nodeToDelete,
    deleteType,
    openDeleteDialog,
    closeDeleteDialog,
  } = useProjectDialogs();
  
  const {
    newItemName,
    setNewItemName,
    errorMessage,
    setErrorMessage,
    resetForm,
    handleCreateClient,
    handleCreateProject,
    handleCreateTask,
    handleEditClient,
    handleEditProject,
    handleEditTask,
    handleDeleteClient,
    handleDeleteProject,
    handleDeleteTask,
  } = useProjectsActions();
  
  const {
    showMoveDialog,
    moveItemData,
    moveDestinations,
    openMoveDialog,
    closeMoveDialog,
    handleConfirmMove,
  } = useProjectMove();
  
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleToggleComplete = (taskId: string) => {
    // Buscar la tarea en el árbol para obtener su estado actual
    const findTask = (nodes: typeof tree): typeof tree[0] | null => {
      for (const node of nodes) {
        if (node.id === taskId && node.type === "task") return node;
        if (node.children) {
          const found = findTask(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    const task = findTask(tree);
    if (task) {
      updateTask(taskId, { isCompleted: !task.isCompleted });
    }
  };

  const handleMoveWithExpand = async (destinationId: string) => {
    await handleConfirmMove(destinationId, (destId) => {
      // Expandir el nodo de destino después de mover
      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        newSet.add(destId);
        return newSet;
      });
    });
  };

  // Auto-expandir nodos que contienen resultados de búsqueda
  useEffect(() => {
    if (searchQuery.trim() && matchingIds.size > 0) {
      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        matchingIds.forEach((id) => newSet.add(id));
        return newSet;
      });
    }
  }, [searchQuery, matchingIds]);

  // Pre-llenar el nombre cuando se abre en modo edit
  useEffect(() => {
    if (!showDialog) return;

    if (isEditMode && editingNodeId) {
      const findNode = (nodes: typeof tree): typeof tree[0] | null => {
        for (const node of nodes) {
          if (node.id === editingNodeId) return node;
          if (node.children) {
            const found = findNode(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      const node = findNode(tree);
      if (node) {
        setNewItemName(node.name);
        setErrorMessage("");
      }
    } else if (!isEditMode) {
      resetForm();
    }
  }, [showDialog, isEditMode, editingNodeId]);

  const handleConfirmDelete = () => {
    if (!nodeToDelete) return;

    if (deleteType === "client") {
      handleDeleteClient(nodeToDelete.id, nodeToDelete.name);
    } else if (deleteType === "project") {
      handleDeleteProject(nodeToDelete.id, nodeToDelete.name);
    } else if (deleteType === "task") {
      handleDeleteTask(nodeToDelete.id, nodeToDelete.name);
    }

    closeDeleteDialog();
  };

  const handleCreate = async () => {
    if (isEditMode) {
      // Modo edición
      const onSuccess = () => {
        setShowDialog(false);
      };

      if (editingNodeType === "client") {
        await handleEditClient(editingNodeId, onSuccess);
      } else if (editingNodeType === "project") {
        await handleEditProject(editingNodeId, selectedParentId, onSuccess);
      } else if (editingNodeType === "task") {
        await handleEditTask(editingNodeId, selectedParentId, onSuccess);
      }
    } else {
      // Modo creación
      const onSuccess = (newElementId: string, parentIds: string[]) => {
        // Auto-expandir elementos
        setExpandedNodes((prev) => {
          const newSet = new Set(prev);
          parentIds.forEach((id) => newSet.add(id));
          newSet.add(newElementId);
          return newSet;
        });
        
        // Cerrar diálogo
        setShowDialog(false);
      };

      if (dialogType === "client") {
        await handleCreateClient(onSuccess);
      } else if (dialogType === "project") {
        await handleCreateProject(selectedParentId, onSuccess);
      } else if (dialogType === "task") {
        await handleCreateTask(selectedParentId, onSuccess);
      }
    }
  };

  // Calculate totals for header stats
  // totalTime is stored in seconds, so convert to hours or minutes
  const totalSeconds = tree.reduce((sum, p) => sum + (p.totalTime || 0), 0);
  const totalTimeDisplay = formatDuration(totalSeconds);
  const totalClients = tree.length;
  const totalProjects = tree.reduce((sum, p) => sum + (p.children?.length || 0), 0);

  // Show loading skeleton
  if (isLoading) {
    return <SkeletonProjects />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Proyectos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Organiza tus clientes, proyectos y tareas
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{totalClients} clientes</span>
            <span>•</span>
            <span>{totalProjects} proyectos</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {totalTimeDisplay} total
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => openAddDialog("client")}
            size="sm"
            className="gap-2 bg-gradient-to-r from-[#38a3a5] to-[#57cc99] hover:from-[#22577a] hover:to-[#38a3a5]"
          >
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar cliente, proyecto o tarea..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-9 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Projects Accordion List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Column Headers */}
        <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="w-5" /> {/* Spacer for chevron */}
          <div className="w-4" /> {/* Spacer for icon */}
          <div className="flex-1">Nombre</div>
          <div className="w-12 text-right">Total</div>
          <div className="hidden lg:block w-20 text-right">Actividad</div>
          <div className="w-16" /> {/* Spacer for actions */}
        </div>

        {/* Projects Tree */}
        {filteredProjects.length > 0 ? (
          filteredProjects.map((node) => (
            <ProjectNodeItem
              key={node.id}
              node={node}
              level={0}
              parentId=""
              expandedNodes={expandedNodes}
              onToggle={toggleNode}
              onAddChild={openAddDialog}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onMove={openMoveDialog}
              onToggleComplete={handleToggleComplete}
            />
          ))
        ) : searchQuery ? (
          <div className="text-center py-12">
            <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              No se encontraron resultados para &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">No hay clientes creados</p>
            <p className="text-sm text-gray-400">Crea tu primer cliente para empezar</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar" : "Agregar"} {dialogType === "client" ? "Cliente" : dialogType === "project" ? "Proyecto" : "Tarea"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? `Modifica el nombre del ${dialogType === "client" ? "cliente" : dialogType === "project" ? "proyecto" : "tarea"}`
                : dialogType === "client" 
                  ? "Crea un nuevo cliente para organizar tus proyectos"
                  : dialogType === "project"
                  ? "Agrega un proyecto al cliente seleccionado"
                  : "Crea una tarea específica dentro del proyecto"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={newItemName}
                onChange={(e) => {
                  setNewItemName(e.target.value);
                  setErrorMessage(""); // Limpiar error al escribir
                }}
                placeholder={
                  dialogType === "client"
                    ? "Ej: BanReservas"
                    : dialogType === "project"
                    ? "Ej: Sistema de Pagos"
                    : "Ej: Implementar API de transacciones"
                }
              />
              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>
              {isEditMode ? "Guardar cambios" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {nodeToDelete && (
                <>
                  {deleteType === "client" && (
                    <>
                      Estás a punto de eliminar el cliente <strong>{nodeToDelete.name}</strong>.
                      {nodeToDelete.children && nodeToDelete.children.length > 0 && (
                        <>
                          {" "}Esto también eliminará <strong>{nodeToDelete.children.length} proyecto(s)</strong> y todas sus tareas asociadas.
                        </>
                      )}
                    </>
                  )}
                  {deleteType === "project" && (
                    <>
                      Estás a punto de eliminar el proyecto <strong>{nodeToDelete.name}</strong>.
                      {nodeToDelete.children && nodeToDelete.children.length > 0 && (
                        <>
                          {" "}Esto también eliminará <strong>{nodeToDelete.children.length} tarea(s)</strong> asociadas.
                        </>
                      )}
                    </>
                  )}
                  {deleteType === "task" && (
                    <>
                      Estás a punto de eliminar la tarea <strong>{nodeToDelete.name}</strong>.
                    </>
                  )}
                  <br /><br />
                  Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move Item Dialog */}
      {moveItemData && (
        <MoveItemDialog
          open={showMoveDialog}
          onOpenChange={(open) => !open && closeMoveDialog()}
          destinations={moveDestinations}
          currentParentId={moveItemData.currentParentId}
          itemName={moveItemData.node.name}
          itemType={moveItemData.type}
          onMove={handleMoveWithExpand}
        />
      )}
    </div>
  );
}
