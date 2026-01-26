import { useState, useMemo } from 'react';
import { TreeNode } from '@/types';
import { useProjectTree } from './useProjectTree';

/**
 * Hook para manejar el estado y lógica del selector de árbol de proyectos
 * 
 */
export const useProjectTreeState = (selectedTaskId: string | null) => {
  const { tree: projects, isLoading } = useProjectTree();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

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
   * Filtrar nodos basado en búsqueda
   */
  const filterNodes = useMemo(() => {
    if (!searchTerm) return projects;
    
    const nodesToExpand = new Set<string>();
    
    const filter = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.reduce<TreeNode[]>((acc, node) => {
        const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
        const filteredChildren = node.children ? filter(node.children) : [];
        
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : node.children,
          });
          
          // Marcar para auto-expandir
          if (filteredChildren.length > 0 || matchesSearch) {
            nodesToExpand.add(node.id);
          }
        }
        
        return acc;
      }, []);
    };
    
    const result = filter(projects);
    
    // Expandir nodos después del filtrado
    if (nodesToExpand.size > 0) {
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        nodesToExpand.forEach(id => newSet.add(id));
        return newSet;
      });
    }
    
    return result;
  }, [projects, searchTerm]);

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
    filteredProjects: filterNodes,
    
    // Acciones
    setSearchTerm,
    toggleNode,
    
    // Utilidades
    getNodePath,
  };
};
