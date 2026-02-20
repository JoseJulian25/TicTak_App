import React, { useState, useMemo } from "react";
import { Building2, FolderKanban, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MoveDestination {
  id: string;
  name: string;
  type: "client" | "project";
  clientId?: string;
  clientName?: string;
}

interface MoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destinations: MoveDestination[];
  currentParentId: string;
  itemName: string;
  itemType: "project" | "task";
  onMove: (destinationId: string) => void;
}

interface ClientGroup {
  clientId: string;
  clientName: string;
  destinations: MoveDestination[];
}

export function MoveItemDialog({
  open,
  onOpenChange,
  destinations,
  currentParentId,
  itemName,
  itemType,
  onMove,
}: MoveItemDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);

  // Agrupar destinos por cliente (solo para tareas que se mueven a proyectos)
  const groupedByClient = useMemo(() => {
    if (itemType === "project") {
      // Para proyectos, simplemente filtrar clientes
      return null;
    }

    // Para tareas, agrupar proyectos por cliente
    const groups = new Map<string, ClientGroup>();
    
    destinations.forEach((dest) => {
      if (dest.type === "project" && dest.clientId && dest.clientName) {
        if (!groups.has(dest.clientId)) {
          groups.set(dest.clientId, {
            clientId: dest.clientId,
            clientName: dest.clientName,
            destinations: [],
          });
        }
        groups.get(dest.clientId)!.destinations.push(dest);
      }
    });

    return Array.from(groups.values());
  }, [destinations, itemType]);

  // Filtrar destinos basados en búsqueda y excluir el padre actual
  const filteredDestinations = useMemo(() => {
    const filtered = destinations
      .filter((dest) => dest.id !== currentParentId)
      .filter((dest) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesName = dest.name.toLowerCase().includes(searchLower);
        const matchesClient = dest.clientName?.toLowerCase().includes(searchLower);
        return matchesName || matchesClient;
      });

    return filtered;
  }, [destinations, currentParentId, searchQuery]);

  // Filtrar grupos de clientes basados en búsqueda
  const filteredGroups = useMemo(() => {
    if (!groupedByClient) return null;

    if (!searchQuery.trim()) {
      return groupedByClient
        .map((group) => ({
          ...group,
          destinations: group.destinations.filter((dest) => dest.id !== currentParentId),
        }))
        .filter((group) => group.destinations.length > 0);
    }

    const searchLower = searchQuery.toLowerCase();
    return groupedByClient
      .map((group) => ({
        ...group,
        destinations: group.destinations.filter((dest) => {
          if (dest.id === currentParentId) return false;
          const matchesName = dest.name.toLowerCase().includes(searchLower);
          const matchesClient = group.clientName.toLowerCase().includes(searchLower);
          return matchesName || matchesClient;
        }),
      }))
      .filter((group) => group.destinations.length > 0);
  }, [groupedByClient, searchQuery, currentParentId]);

  const handleConfirm = () => {
    if (selectedDestinationId) {
      onMove(selectedDestinationId);
      setSelectedDestinationId(null);
      setSearchQuery("");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedDestinationId(null);
    setSearchQuery("");
  };

  const destinationType = itemType === "task" ? "proyecto" : "cliente";
  const icon = itemType === "task" ? FolderKanban : Building2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[calc(100vw-2rem)] sm:w-full max-h-[min(600px,90svh)] flex flex-col">
        <DialogHeader className="min-w-0">
          <DialogTitle>Mover {itemType === "task" ? "tarea" : "proyecto"}</DialogTitle>
          <DialogDescription className="break-words">
            Selecciona el {destinationType} de destino para{" "}
            <span className="font-medium break-all">{itemName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Campo de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Buscar ${destinationType}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Lista de destinos */}
        <ScrollArea className="h-[300px] pr-4">
          {(itemType === "task" ? filteredGroups : filteredDestinations)?.length === 0 || 
           (itemType === "task" && (!filteredGroups || filteredGroups.length === 0)) ? (
            <div className="text-center py-12">
              {React.createElement(icon, { className: "h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" })}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? `No se encontraron ${destinationType}s`
                  : `No hay ${destinationType}s disponibles`}
              </p>
            </div>
          ) : itemType === "task" && filteredGroups ? (
            // Vista agrupada por cliente (para tareas)
            <div className="space-y-3">
              {filteredGroups.map((group) => (
                <div key={group.clientId}>
                  {/* Encabezado del cliente */}
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2 min-w-0">
                    <Building2 className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="truncate">{group.clientName}</span>
                  </div>

                  {/* Lista de proyectos del cliente */}
                  <div className="ml-6 space-y-2">
                    {group.destinations.map((destination) => {
                      const isSelected = selectedDestinationId === destination.id;
                      const isCurrent = destination.id === currentParentId;

                      return (
                        <button
                          key={destination.id}
                          onClick={() => !isCurrent && setSelectedDestinationId(destination.id)}
                          disabled={isCurrent}
                          className={`
                            w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left
                            ${isCurrent
                              ? "opacity-50 cursor-not-allowed"
                              : isSelected
                              ? "bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            }
                          `}
                        >
                          <FolderKanban className="h-4 w-4 text-purple-500 shrink-0" />
                          <span className="text-sm text-gray-900 dark:text-gray-100 flex-1 truncate">
                            {destination.name}
                            {isCurrent && (
                              <span className="text-xs text-gray-500 ml-2">(actual)</span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Vista simple (para proyectos moviéndose a clientes)
            <div className="space-y-2">
              {filteredDestinations.map((destination) => {
                const isSelected = selectedDestinationId === destination.id;
                const isCurrent = destination.id === currentParentId;
                
                return (
                  <button
                    key={destination.id}
                    onClick={() => !isCurrent && setSelectedDestinationId(destination.id)}
                    disabled={isCurrent}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left
                      ${isCurrent
                        ? "opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }
                    `}
                  >
                    <span className={destination.type === "client" ? "text-blue-500" : "text-purple-500"}>
                      {destination.type === "client" ? (
                        <Building2 className="h-5 w-5" />
                      ) : (
                        <FolderKanban className="h-5 w-5" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {destination.name}
                        {isCurrent && (
                          <span className="text-xs text-gray-500 ml-2">(actual)</span>
                        )}
                      </p>
                      {destination.clientName && (
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {destination.clientName}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Botones de acción */}
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedDestinationId}
          >
            Mover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
