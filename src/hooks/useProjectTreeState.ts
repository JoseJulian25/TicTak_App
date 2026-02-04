import { useState, useMemo, useEffect } from 'react';
import { TreeNode } from '@/types';
import { useProjectTree } from './useProjectTree';
import { useProjectSearch } from './useProjectSearch';

/**
 * Hook para manejar el estado y lógica del selector de árbol de proyectos
 * Usa useProjectSearch para centralizar la lógica de búsqueda y filtrado
 */
export const useProjectTreeState = (selectedTaskId: string | null) => {
  const { tree: projects, isLoading } = useProjectTree();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  
  const {
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
    filteredProjects,
    matchingIds
  } = useProjectSearch(projects);

  // Auto-expandir nodos que contienen resultados de búsqueda (igual que ProjectsView)
  useEffect(() => {
    if (searchTerm.trim() && matchingIds.size > 0) {
      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        matchingIds.forEach((id) => newSet.add(id));
        return newSet;
      });
    }
  }, [searchTerm, matchingIds]);

  /**
   * Encontrar un nodo por su ID en el árbol
   */
  const findNodeById = (nodes: TreeNode[], id: string | null): TreeNode | null => {
    if (!id) return null;
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  /**
   * Obtener el path completo de un nodo (Cliente > Proyecto > Tarea)
   */
  const getNodePath = (node: TreeNode | null): string => {
    if (!node) return 'Seleccionar tarea';
    
    const parts: string[] = [node.name];
    let current = node;
    
    const findParent = (nodeId: string | undefined, nodes: TreeNode[]): TreeNode | null => {
      if (!nodeId) return null;
      
      for (const n of nodes) {
        if (n.id === nodeId) return n;
        if (n.children) {
          const found = findParent(nodeId, n.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    while (current.parentId) {
      const parent = findParent(current.parentId, projects);
      if (parent) {
        parts.unshift(parent.name);
        current = parent;
      } else {
        break;
      }
    }
    
    return parts.join(' > ');
  };

  /**
   * Toggle expansión de un nodo
   */
  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Nodo seleccionado actual
  const selectedNode = useMemo(() => findNodeById(projects, selectedTaskId), [projects, selectedTaskId]);

  return {
    // Estado
    projects,
    isLoading,
    expandedNodes,
    searchTerm,
    selectedNode,
    filteredProjects,
    
    // Acciones
    setSearchTerm,
    toggleNode,
    
    // Utilidades
    getNodePath,
  };
};
