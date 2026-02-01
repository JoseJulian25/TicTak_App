import { LOCAL_STORAGE_KEYS } from '@/lib/constants';
import { generateId } from '@/lib/id-generator';
import { Storage } from '@/lib/storage';
import { CreateProjectInput, Project, Task } from '@/types/index';
import { create } from 'zustand/react';
import { useClientStore } from './useClientStore';

interface ProjectStore {
    projects: Project[];
    isLoading: boolean;

    loadProjects: () => void;
    addProject: (project: CreateProjectInput) => Project;
    updateProject: (id: string, data: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    hardDeleteProject: (id: string) => void;
    archiveProject: (id: string) => void;
    restoreProject: (id: string) => void;
    getProjectById: (id: string) => Project | undefined;
    getProjectsByClient: (clientId: string, includeArchived?: boolean) => Project[];
    getActiveProjects: () => Project[];
    getArchivedProjects: () => Project[];
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
    projects: [],
    isLoading: false,

    loadProjects: () => {
        const projects = Storage.getItem<Project[]>(LOCAL_STORAGE_KEYS.PROJECTS) || [];
        set({ projects });
    },

    addProject: (input: CreateProjectInput) => {

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
            const updatedProjects = state.projects.map(
                (project) => id === project.id ? { ...project, ...data, updatedAt: new Date() } : project
            );

            Storage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, updatedProjects);
            return { projects: updatedProjects };
        });
    },

    deleteProject: (id: string) => {
        set((state) => {
            const updatedProjects = state.projects.filter((project) => project.id !== id);

            Storage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, updatedProjects);

            return { projects: updatedProjects };
        });
    },

    hardDeleteProject: (id: string) => {
        const { useTaskStore } = require('./useTaskStore');
        
        const taskStore = useTaskStore.getState();
        const projectTasks = taskStore.tasks.filter((t: Task) => t.projectId === id);
        
        projectTasks.forEach((task: Task) => {
            taskStore.deleteTask(task.id);
        });
        
        get().deleteProject(id);
    },

    archiveProject: (id: string) => {
        set((state) => {
            const updatedProjects = state.projects.map((project) =>
                project.id === id ? { ...project, isArchived: true, updatedAt: new Date() } : project
            );

            Storage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, updatedProjects);

            return { projects: updatedProjects };
        });
    },

    restoreProject: (id: string) => {
        set((state) => {
            const updatedProjects = state.projects.map((project) =>
                project.id === id ? { ...project, isArchived: false, updatedAt: new Date() } : project
            );

            Storage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, updatedProjects);

            return { projects: updatedProjects };
        });
    },

    getProjectById: (id: string) => {
        return get().projects.find(project => project.id === id);
    },

    getProjectsByClient: (clientId: string, includeArchived: boolean = false) => {
        return get().projects.filter(
            project => project.clientId === clientId && (includeArchived || !project.isArchived)
        );
    },

    getActiveProjects: () => {
        return get().projects.filter((project) => !project.isArchived);
    },

    getArchivedProjects: () => {
        return get().projects.filter((project) => project.isArchived);
    },

}));

useProjectStore.getState().loadProjects();