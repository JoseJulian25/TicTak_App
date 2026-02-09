import { useState } from "react";
import { TreeNode } from "@/types";
import { useTaskStore } from "@/stores/useTaskStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { useClientStore } from "@/stores/useClientStore";

interface MoveDestination {
  id: string;
  name: string;
  type: "client" | "project";
  clientId?: string;
  clientName?: string;
}

export function useProjectMove() {
  const { moveTaskToProject } = useTaskStore();
  const { moveProjectToClient, projects } = useProjectStore();
  const { clients } = useClientStore();

  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveItemData, setMoveItemData] = useState<{
    node: TreeNode;
    type: "project" | "task";
    currentParentId: string;
  } | null>(null);

  const openMoveDialog = (
    node: TreeNode,
    type: "project" | "task",
    currentParentId: string
  ) => {
    setMoveItemData({ node, type, currentParentId });
    setShowMoveDialog(true);
  };

  const closeMoveDialog = () => {
    setShowMoveDialog(false);
    setMoveItemData(null);
  };

  const handleConfirmMove = async (
    destinationId: string,
    onSuccess?: (destinationId: string) => void
  ) => {
    if (!moveItemData) return;

    try {
      if (moveItemData.type === "task") {
        await moveTaskToProject(moveItemData.node.id, destinationId);
      } else if (moveItemData.type === "project") {
        await moveProjectToClient(moveItemData.node.id, destinationId);
      }

      onSuccess?.(destinationId);
      closeMoveDialog();
    } catch (error) {
      console.error("Error moving item:", error);
    }
  };

  // Preparar lista de destinos según el tipo
  const moveDestinations: MoveDestination[] = moveItemData
    ? moveItemData.type === "task"
      ? projects
          .filter((p) => !p.isArchived)
          .map((p) => {
            const client = clients.find((c) => c.id === p.clientId);
            return {
              id: p.id,
              name: p.name,
              type: "project" as const,
              clientId: p.clientId,
              clientName: client?.name || "Sin cliente",
            };
          })
      : clients.map((c) => ({
          id: c.id,
          name: c.name,
          type: "client" as const,
        }))
    : [];

  return {
    showMoveDialog,
    moveItemData,
    moveDestinations,
    openMoveDialog,
    closeMoveDialog,
    handleConfirmMove,
  };
}
