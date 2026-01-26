import { LOCAL_STORAGE_KEYS } from '@/lib/constants';
import { generateId } from '@/lib/id-generator';
import { Storage } from '@/lib/storage';
import { CreateProjectInput, Project } from '@/types/index';
import { create } from 'zustand/react';
import { useClientStore } from './useClientStore';

interface ProjectStore {
    projects: Project[];
    isLoading: boolean;

    loadProjects: () => void;
    addProject: (project: CreateProjectInput) => Project;
    updateProject: (id: string, data: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    getProjectById: (id: string) => Project | undefined;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
    projects: [],
    isLoading: false,

    loadProjects: () => {
        const projects = Storage.getItem<Project[]>(LOCAL_STORAGE_KEYS.PROJECTS) || [];
        set({ projects });
    },

    addProject: (input: CreateProjectInput) => {

        //Validar que el Cliente exista
        const client  = useClientStore.getState().getClientById(input.clientId);

        if (!client) {
            throw new Error('Cliente no encontrado al crear el proyecto');
        }

        const newProject: Project = {
            id: generateId('project'),
            name: input.name,
            clientId: input.clientId,
            description: input.description || '',
            color: input.color || '#10b981', 
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        set((state) => {
            const updatedProjects = [...state.projects, newProject];
            Storage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, updatedProjects);
            return { projects: updatedProjects };
        });

        return newProject;
    },

    updateProject: (id: string, data: Partial<Project>) => {
        set((state) => {
            const updatedProjects = state.projects.map((project) => id === project.id
                ? { ...project, ...data, updatedAt: new Date() }
                : project
            );
            Storage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, updatedProjects);
            return { projects: updatedProjects };
        });
    },

    deleteProject: (id: string) => {
        set((state) => {
            // Soft delete: solo marcar como archivado
      const updatedProjects = state.projects.map((project) =>
        project.id === id
          ? { ...project, isArchived: true, updatedAt: new Date()}
          : project
      );

      Storage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, updatedProjects);

      return { projects: updatedProjects };
        });
    },

    getProjectById: (id: string) => {
        return get().projects.find(project => project.id === id);
    }

}));

useProjectStore.getState().loadProjects();