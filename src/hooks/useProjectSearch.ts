import { useState, useEffect, useMemo } from 'react';
import { TreeNode } from '@/types';

/**
 * Hook para manejar la búsqueda y filtrado del árbol de proyectos
 */
export const useProjectSearch = (tree: TreeNode[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce de búsqueda para mejor performance
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const filterProjects = (nodes: TreeNode[], query: string): { filtered: TreeNode[]; matchingIds: Set<string> } => {
    if (!query.trim()) return { filtered: nodes, matchingIds: new Set() };
    
    const matchingIds = new Set<string>();
    const lowerQuery = query.toLowerCase();

    const filterRecursive = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.reduce((acc: TreeNode[], node: TreeNode) => {
        const matchesDirectly = node.name.toLowerCase().includes(lowerQuery);
        const filteredChildren = node.children 
          ? filterRecursive(node.children)
          : [];
        
        if (matchesDirectly || filteredChildren.length > 0) {
          // Agregar este nodo y sus padres a los nodos que deben expandirse
          if (matchesDirectly) {
            matchingIds.add(node.id);
          }
          if (filteredChildren.length > 0) {
            matchingIds.add(node.id);
          }

          acc.push({
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : node.children
          });
        }
        
        return acc;
      }, [] as TreeNode[]);
    };

    const filtered = filterRecursive(nodes);
    return { filtered, matchingIds };
  };

  const { filtered: filteredProjects, matchingIds } = useMemo(
    () => filterProjects(tree, debouncedSearchQuery),
    [tree, debouncedSearchQuery]
  );

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    filteredProjects,
    matchingIds,
  };
};
