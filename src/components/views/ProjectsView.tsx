"use client";

import { useState } from "react";
import { Plus, MoreVertical, Clock, ChevronDown, ChevronRight, Folder, FolderOpen, FileText, Search, TrendingUp, BarChart3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ProjectNode } from "@/types/projectNode";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { SkeletonProjects } from "@/components/skeletons/SkeletonProjects";

export function ProjectsView() {
  const { isInitialized } = useAppInitialization();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["1", "2"]));
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"client" | "project" | "subtask">("client");
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<{
    node: ProjectNode;
    type: "client" | "project" | "subtask";
  } | null>(null);

  const projects: ProjectNode[] = [
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
          ],
        },
      ],
    },
  ];

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const countSubtasks = (node: ProjectNode): number => {
    if (node.type === "subtask") return 1;
    if (!node.children) return 0;
    return node.children.reduce((acc, child) => acc + countSubtasks(child), 0);
  };

  const openAddDialog = (type: "client" | "project" | "subtask", parentId?: string) => {
    setDialogType(type);
    setSelectedParentId(parentId || "");
    setShowDialog(true);
  };

  const filterProjects = (nodes: ProjectNode[], query: string): ProjectNode[] => {
    if (!query.trim()) return nodes;
    
    return nodes.reduce((acc, node) => {
      const matchesDirectly = node.name.toLowerCase().includes(query.toLowerCase());
      const filteredChildren = node.children 
        ? filterProjects(node.children, query)
        : [];
      
      if (matchesDirectly || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children
        });
      }
      
      return acc;
    }, [] as ProjectNode[]);
  };

  const filteredProjects = filterProjects(projects, searchQuery);

  const generateStats = (node: ProjectNode) => {
    return {
      totalHours: Math.floor(Math.random() * 50) + 10,
      thisWeek: Math.floor(Math.random() * 15) + 2,
      thisMonth: Math.floor(Math.random() * 40) + 5,
      tasksCompleted: node.type === "subtask" ? 1 : countSubtasks(node),
      activeDays: Math.floor(Math.random() * 20) + 5,
    };
  };

  const renderNode = (node: ProjectNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const subtaskCount = countSubtasks(node);

    const getIcon = () => {
      if (node.type === "subtask") {
        return <FileText className="h-5 w-5 text-white" />;
      }
      if (hasChildren && isExpanded) {
        return <FolderOpen className="h-5 w-5 text-white" />;
      }
      return <Folder className="h-5 w-5 text-white" />;
    };

    const getBgColor = () => {
      if (node.type === "client") return "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900";
      if (node.type === "project") return "bg-white dark:bg-gray-800";
      return "bg-gray-50 dark:bg-gray-800/50";
    };

    return (
      <div key={node.id} style={{ marginLeft: level > 0 ? "24px" : "0" }}>
        <div
          className={`${getBgColor()} rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-3`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {hasChildren && (
                <button
                  onClick={() => toggleNode(node.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              )}
              {!hasChildren && <div className="w-7" />}
              
              <div className={`w-12 h-12 rounded-xl ${
                node.type === "client" 
                  ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                  : node.type === "project"
                  ? "bg-gradient-to-br from-purple-500 to-purple-600"
                  : "bg-gradient-to-br from-green-500 to-green-600"
              } flex items-center justify-center shadow-md flex-shrink-0`}>
                {getIcon()}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`${
                    node.type === "client" ? "text-lg" : "text-base"
                  } font-semibold text-gray-900 dark:text-gray-100`}>
                    {node.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {node.type === "client" ? "Cliente" : node.type === "project" ? "Proyecto" : "Tarea"}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mt-1">
                  {node.type !== "subtask" && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <FileText className="h-4 w-4" />
                      <span>{subtaskCount} {subtaskCount === 1 ? "tarea" : "tareas"}</span>
                    </div>
                  )}
                  {node.type === "subtask" && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>2.5h este mes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {node.type !== "subtask" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAddDialog(
                    node.type === "client" ? "project" : "subtask",
                    node.id
                  )}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {node.type === "client" ? "Proyecto" : "Tarea"}
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setSelectedItem({ node, type: node.type })}
              >
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2">
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isInitialized) {
    return <SkeletonProjects />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-300">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Proyectos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona clientes, proyectos y tareas
          </p>
        </div>
        <Button
          onClick={() => openAddDialog("client")}
          className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por cliente, proyecto o tarea..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 h-12 text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Projects Tree */}
      <div className="space-y-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((node) => renderNode(node, 0))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron resultados para &quot;{searchQuery}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Agregar {dialogType === "client" ? "Cliente" : dialogType === "project" ? "Proyecto" : "Tarea"}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "client" 
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
                placeholder={
                  dialogType === "client"
                    ? "Ej: BanReservas"
                    : dialogType === "project"
                    ? "Ej: Sistema de Pagos"
                    : "Ej: Implementar API de transacciones"
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowDialog(false)}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={selectedItem !== null} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${
                    selectedItem.type === "client" 
                      ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                      : selectedItem.type === "project"
                      ? "bg-gradient-to-br from-purple-500 to-purple-600"
                      : "bg-gradient-to-br from-green-500 to-green-600"
                  } flex items-center justify-center`}>
                    {selectedItem.type === "subtask" ? (
                      <FileText className="h-5 w-5 text-white" />
                    ) : (
                      <Folder className="h-5 w-5 text-white" />
                    )}
                  </div>
                  {selectedItem.node.name}
                </DialogTitle>
                <DialogDescription>
                  Estadísticas detalladas de {selectedItem.type === "client" ? "cliente" : selectedItem.type === "project" ? "proyecto" : "tarea"}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {(() => {
                    const stats = generateStats(selectedItem.node);
                    return (
                      <>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-blue-600 dark:text-blue-400">Total</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {stats.totalHours}h
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm text-purple-600 dark:text-purple-400">Esta Semana</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {stats.thisWeek}h
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm text-green-600 dark:text-green-400">Este Mes</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {stats.thisMonth}h
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <span className="text-sm text-orange-600 dark:text-orange-400">
                              {selectedItem.type === "subtask" ? "Completada" : "Tareas"}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {stats.tasksCompleted}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Actividad Reciente
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Último trabajo</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Hace 2 horas</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Días activos</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {generateStats(selectedItem.node).activeDays} días
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Promedio/sesión</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">2.3h</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setSelectedItem(null)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
