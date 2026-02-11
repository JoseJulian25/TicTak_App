import { useState, useEffect, useMemo } from "react";
import { useProjectTreeForProjects } from "./useProjectTreeForProjects";
import { useProjectSearch } from "./useProjectSearch";
import { useProjectDialogs } from "./useProjectDialogs";
import { useProjectsActions } from "./useProjectsActions";
import { useProjectMove } from "./useProjectMove";
import { useTaskStore } from "@/stores/useTaskStore";
import { formatDuration } from "@/lib/time-utils";
import { TreeNode } from "@/types";

/**
 * Hook consolidado para ProjectsView
 * Concentra toda la lógica de negocio, efectos y estados derivados
 */
export function useProjectsView() {
  // Estados base
  const { tree, isLoading } = useProjectTreeForProjects(false);
  const { searchQuery, setSearchQuery, filteredProjects, matchingIds } = useProjectSearch(tree);
  const { updateTask } = useTaskStore();
  
  // Diálogos y acciones
  const dialogsState = useProjectDialogs();
  const actionsState = useProjectsActions();
  const moveState = useProjectMove();
  
  // Estado local de nodos expandidos
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  /**
   * Expande o colapsa un nodo en el árbol
   */
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

  /**
   * Busca recursivamente un nodo en el árbol
   */
  const findNodeInTree = (nodes: TreeNode[], targetId: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === targetId) return node;
      if (node.children) {
        const found = findNodeInTree(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  /**
   * Alterna el estado de completado de una tarea
   */
  const handleToggleComplete = (taskId: string) => {
    const task = findNodeInTree(tree, taskId);
    if (task && task.type === "task") {
      updateTask(taskId, { isCompleted: !task.isCompleted });
    }
  };

  /**
   * Mueve un elemento y expande automáticamente el nodo de destino
   */
  const handleMoveWithExpand = async (destinationId: string) => {
    await moveState.handleConfirmMove(destinationId, (destId) => {
      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        newSet.add(destId);
        return newSet;
      });
    });
  };

  /**
   * Confirma la eliminación de un nodo
   */
  const handleConfirmDelete = () => {
    const { nodeToDelete, deleteType } = dialogsState;
    if (!nodeToDelete) return;

    if (deleteType === "client") {
      actionsState.handleDeleteClient(nodeToDelete.id, nodeToDelete.name);
    } else if (deleteType === "project") {
      actionsState.handleDeleteProject(nodeToDelete.id, nodeToDelete.name);
    } else if (deleteType === "task") {
      actionsState.handleDeleteTask(nodeToDelete.id, nodeToDelete.name);
    }

    dialogsState.closeDeleteDialog();
  };

  /**
   * Maneja la creación o edición de elementos
   */
  const handleCreate = async () => {
    const { isEditMode, editingNodeType, editingNodeId, selectedParentId, dialogType, setShowDialog } = dialogsState;
    
    if (isEditMode) {
      // Modo edición
      const onSuccess = () => {
        setShowDialog(false);
      };

      if (editingNodeType === "client") {
        await actionsState.handleEditClient(editingNodeId, onSuccess);
      } else if (editingNodeType === "project") {
        await actionsState.handleEditProject(editingNodeId, selectedParentId, onSuccess);
      } else if (editingNodeType === "task") {
        await actionsState.handleEditTask(editingNodeId, selectedParentId, onSuccess);
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
        await actionsState.handleCreateClient(onSuccess);
      } else if (dialogType === "project") {
        await actionsState.handleCreateProject(selectedParentId, onSuccess);
      } else if (dialogType === "task") {
        await actionsState.handleCreateTask(selectedParentId, onSuccess);
      }
    }
  };

  /**
   * Auto-expandir nodos que contienen resultados de búsqueda
   */
  useEffect(() => {
    if (searchQuery.trim() && matchingIds.size > 0) {
      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        matchingIds.forEach((id) => newSet.add(id));
        return newSet;
      });
    }
  }, [searchQuery, matchingIds]);

  /**
   * Pre-llenar el nombre cuando se abre en modo edit
   */
  useEffect(() => {
    const { showDialog, isEditMode, editingNodeId } = dialogsState;
    if (!showDialog) return;

    if (isEditMode && editingNodeId) {
      const node = findNodeInTree(tree, editingNodeId);
      if (node) {
        actionsState.setNewItemName(node.name);
        actionsState.setErrorMessage("");
      }
    } else if (!isEditMode) {
      actionsState.resetForm();
    }
  }, [dialogsState.showDialog, dialogsState.isEditMode, dialogsState.editingNodeId, tree]);

  /**
   * Calcula las estadísticas totales para el header
   */
  const stats = useMemo(() => {
    const totalSeconds = tree.reduce((sum, p) => sum + (p.totalTime || 0), 0);
    const totalTimeDisplay = formatDuration(totalSeconds);
    const totalClients = tree.length;
    const totalProjects = tree.reduce((sum, p) => sum + (p.children?.length || 0), 0);

    return {
      totalSeconds,
      totalTimeDisplay,
      totalClients,
      totalProjects,
    };
  }, [tree]);

  return {
    // Estado de carga
    isLoading,
    
    // Datos del árbol
    tree,
    filteredProjects,
    
    // Búsqueda
    searchQuery,
    setSearchQuery,
    
    // Expansión de nodos
    expandedNodes,
    toggleNode,
    
    // Estadísticas
    stats,
    
    // Handlers de acciones
    handleToggleComplete,
    handleCreate,
    handleConfirmDelete,
    handleMoveWithExpand,
    
    // Estados de diálogos
    dialogsState,
    actionsState,
    moveState,
  };
}
