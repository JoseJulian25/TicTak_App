import { useState } from 'react';
import { TreeNode } from '@/types';

/**
 * Hook para manejar la lógica de diálogos (crear/editar/eliminar)
 */
export const useProjectDialogs = () => {
  // Estados para Dialog de crear/editar
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"client" | "project" | "task">("client");
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string>("");
  const [editingNodeType, setEditingNodeType] = useState<"client" | "project" | "task">("client");
  
  // Estados para AlertDialog de eliminación
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<TreeNode | null>(null);
  const [deleteType, setDeleteType] = useState<"client" | "project" | "task">("client");

  const openAddDialog = (type: "client" | "project" | "task", parentId?: string) => {
    setDialogType(type);
    setSelectedParentId(parentId || "");
    setIsEditMode(false);
    setShowDialog(true);
  };

  const openEditDialog = (
    node: TreeNode, 
    type: "client" | "project" | "task", 
    parentId?: string
  ) => {
    setEditingNodeId(node.id);
    setEditingNodeType(type);
    setDialogType(type);
    setSelectedParentId(parentId || "");
    setIsEditMode(true);
    setShowDialog(true);
  };

  const openDeleteDialog = (node: TreeNode, type: "client" | "project" | "task") => {
    setNodeToDelete(node);
    setDeleteType(type);
    setShowDeleteDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setNodeToDelete(null);
  };

  return {
    // Dialog de crear/editar
    showDialog,
    setShowDialog,
    dialogType,
    selectedParentId,
    isEditMode,
    editingNodeId,
    editingNodeType,
    openAddDialog,
    openEditDialog,
    closeDialog,
    
    // Dialog de eliminar
    showDeleteDialog,
    setShowDeleteDialog,
    nodeToDelete,
    deleteType,
    openDeleteDialog,
    closeDeleteDialog,
  };
};
