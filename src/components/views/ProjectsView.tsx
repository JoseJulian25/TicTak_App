"use client";

import { Plus, Clock, Building2, Search, X } from "lucide-react";
import { useProjectsView } from "@/hooks/useProjectsView";
import { SkeletonProjects } from "@/components/skeletons/SkeletonProjects";
import { ProjectNodeItem } from "@/components/ProjectNodeItem";
import { MoveItemDialog } from "@/components/MoveItemDialog";
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
  const {
    isLoading,
    filteredProjects,
    searchQuery,
    setSearchQuery,
    expandedNodes,
    toggleNode,
    stats,
    handleToggleComplete,
    handleCreate,
    handleConfirmDelete,
    handleMoveWithExpand,
    dialogsState,
    actionsState,
    moveState,
  } = useProjectsView();

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
            <span>{stats.totalClients} clientes</span>
            <span>•</span>
            <span>{stats.totalProjects} proyectos</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {stats.totalTimeDisplay} total
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => dialogsState.openAddDialog("client")}
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
              onAddChild={dialogsState.openAddDialog}
              onEdit={dialogsState.openEditDialog}
              onDelete={dialogsState.openDeleteDialog}
              onMove={moveState.openMoveDialog}
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
      <Dialog open={dialogsState.showDialog} onOpenChange={dialogsState.setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogsState.isEditMode ? "Editar" : "Agregar"} {dialogsState.dialogType === "client" ? "Cliente" : dialogsState.dialogType === "project" ? "Proyecto" : "Tarea"}
            </DialogTitle>
            <DialogDescription>
              {dialogsState.isEditMode 
                ? `Modifica el nombre del ${dialogsState.dialogType === "client" ? "cliente" : dialogsState.dialogType === "project" ? "proyecto" : "tarea"}`
                : dialogsState.dialogType === "client" 
                  ? "Crea un nuevo cliente para organizar tus proyectos"
                  : dialogsState.dialogType === "project"
                  ? "Agrega un proyecto al cliente seleccionado"
                  : "Crea una tarea específica dentro del proyecto"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={actionsState.newItemName}
                onChange={(e) => {
                  actionsState.setNewItemName(e.target.value);
                  actionsState.setErrorMessage(""); // Limpiar error al escribir
                }}
                placeholder={
                  dialogsState.dialogType === "client"
                    ? "Ej: BanReservas"
                    : dialogsState.dialogType === "project"
                    ? "Ej: Sistema de Pagos"
                    : "Ej: Implementar API de transacciones"
                }
              />
              {actionsState.errorMessage && (
                <p className="text-sm text-red-500">{actionsState.errorMessage}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => dialogsState.setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>
              {dialogsState.isEditMode ? "Guardar cambios" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={dialogsState.showDeleteDialog} onOpenChange={dialogsState.closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogsState.nodeToDelete && (
                <>
                  {dialogsState.deleteType === "client" && (
                    <>
                      Estás a punto de eliminar el cliente <strong>{dialogsState.nodeToDelete.name}</strong>.
                      {dialogsState.nodeToDelete.children && dialogsState.nodeToDelete.children.length > 0 && (
                        <>
                          {" "}Esto también eliminará <strong>{dialogsState.nodeToDelete.children.length} proyecto(s)</strong> y todas sus tareas asociadas.
                        </>
                      )}
                    </>
                  )}
                  {dialogsState.deleteType === "project" && (
                    <>
                      Estás a punto de eliminar el proyecto <strong>{dialogsState.nodeToDelete.name}</strong>.
                      {dialogsState.nodeToDelete.children && dialogsState.nodeToDelete.children.length > 0 && (
                        <>
                          {" "}Esto también eliminará <strong>{dialogsState.nodeToDelete.children.length} tarea(s)</strong> asociadas.
                        </>
                      )}
                    </>
                  )}
                  {dialogsState.deleteType === "task" && (
                    <>
                      Estás a punto de eliminar la tarea <strong>{dialogsState.nodeToDelete.name}</strong>.
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
      {moveState.moveItemData && (
        <MoveItemDialog
          open={moveState.showMoveDialog}
          onOpenChange={(open) => !open && moveState.closeMoveDialog()}
          destinations={moveState.moveDestinations}
          currentParentId={moveState.moveItemData.currentParentId}
          itemName={moveState.moveItemData.node.name}
          itemType={moveState.moveItemData.type}
          onMove={handleMoveWithExpand}
        />
      )}
    </div>
  );
}
