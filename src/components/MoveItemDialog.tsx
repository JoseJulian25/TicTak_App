import { useState, useMemo } from "react";
import { Building2, FolderKanban, Search, X, Check } from "lucide-react";
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

  // Filtrar destinos basados en búsqueda y excluir el padre actual
  const filteredDestinations = useMemo(() => {
    return destinations
      .filter((dest) => dest.id !== currentParentId)
      .filter((dest) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesName = dest.name.toLowerCase().includes(searchLower);
        const matchesClient = dest.clientName?.toLowerCase().includes(searchLower);
        return matchesName || matchesClient;
      });
  }, [destinations, currentParentId, searchQuery]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mover {itemType === "task" ? "tarea" : "proyecto"}</DialogTitle>
          <DialogDescription>
            Selecciona el {destinationType} de destino para <span className="font-medium">{itemName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Buscar ${destinationType}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Destination List */}
        <ScrollArea className="h-72 border rounded-lg">
          {filteredDestinations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <p className="text-sm text-center">
                {searchQuery
                  ? `No se encontraron ${destinationType}s`
                  : `No hay ${destinationType}s disponibles`}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredDestinations.map((destination) => {
                const isSelected = selectedDestinationId === destination.id;
                return (
                  <button
                    key={destination.id}
                    onClick={() => setSelectedDestinationId(destination.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent"
                    }`}
                  >
                    <span className={destination.type === "client" ? "text-blue-500" : "text-purple-500"}>
                      {destination.type === "client" ? (
                        <Building2 className="h-5 w-5" />
                      ) : (
                        <FolderKanban className="h-5 w-5" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{destination.name}</p>
                      {destination.clientName && (
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {destination.clientName}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-blue-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Action Buttons */}
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedDestinationId}
          >
            Mover aquí
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
