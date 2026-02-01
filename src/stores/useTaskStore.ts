import { LOCAL_STORAGE_KEYS, PREFIXES_ID } from "@/lib/constants";
import { generateId } from "@/lib/id-generator";
import { Storage } from "@/lib/storage";
import { CreateTaskInput, Task, Session } from "@/types";
import { create } from "zustand/react";
import { useProjectStore } from "./useProjectStore";

interface TaskStore {
    tasks: Task[];
    isLoading: boolean;

    loadTasks: () => void;
    addTask: (input: CreateTaskInput) => Task;
    updateTask: (id: string, data: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    archiveTask: (id: string) => void;
    restoreTask: (id: string) => void;
    moveTaskToProject: (taskId: string, newProjectId: string) => void;
    getTaskById: (id: string) => Task | undefined;
    getTasksByProject: (projectId: string, includeArchived?: boolean) => Task[];
    getActiveTasks: () => Task[];
    getArchivedTasks: () => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({

    tasks: [],
    isLoading: false,

    loadTasks: () => {
        const tasks = Storage.getItem<Task[]>(LOCAL_STORAGE_KEYS.TASKS) || [];
        set({ tasks });
    },

    addTask: (input: CreateTaskInput) => {

        const project = useProjectStore.getState().getProjectById(input.projectId);

        if (!project) {
            throw new Error('Proyecto no encontrado al crear la tarea');
        }

        const newTask: Task = {
            id: generateId(PREFIXES_ID.TASK),
            name: input.name,
            projectId: input.projectId,
            description: input.description || '',
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            isArchived: false,
        };

        set((state) => {
            const updatedTasks = [...state.tasks, newTask];
            Storage.setItem(LOCAL_STORAGE_KEYS.TASKS, updatedTasks);
            return { tasks: updatedTasks };
        });

        return newTask;
    },

    updateTask: (id: string, data: Partial<Task>) => {
        set((state) => {
            const updatedTasks = state.tasks.map((task) =>
                task.id === id ? { ...task, ...data, updatedAt: new Date() } : task
            );
            Storage.setItem(LOCAL_STORAGE_KEYS.TASKS, updatedTasks);
            return { tasks: updatedTasks };
        });
    },

    deleteTask: (id: string) => {

        const { useSessionStore } = require('./useSessionStore');
        const sessionStore = useSessionStore.getState();
        const taskSessions = sessionStore.getSessionsByTask(id);
        
        taskSessions.forEach((session: Session) => {
            sessionStore.deleteSession(session.id);
        });
        
        set((state) => {
            const updatedTasks = state.tasks.filter((task) => task.id !== id);
            Storage.setItem(LOCAL_STORAGE_KEYS.TASKS, updatedTasks);
            return { tasks: updatedTasks };
        });
    },

    archiveTask: (id: string) => {
        set((state) => {
            const updatedTasks = state.tasks.map((task) =>
                task.id === id ? { ...task, isArchived: true, updatedAt: new Date() } : task
            );
            Storage.setItem(LOCAL_STORAGE_KEYS.TASKS, updatedTasks);
            return { tasks: updatedTasks };
        });
    },

    restoreTask: (id: string) => {
        set((state) => {
            const updatedTasks = state.tasks.map((task) =>
                task.id === id ? { ...task, isArchived: false, updatedAt: new Date() } : task
            );
            Storage.setItem(LOCAL_STORAGE_KEYS.TASKS, updatedTasks);
            return { tasks: updatedTasks };
        });
    },

    moveTaskToProject: (taskId: string, newProjectId: string) => {
        const project = useProjectStore.getState().getProjectById(newProjectId);
        
        if (!project) {
            throw new Error('Proyecto de destino no encontrado');
        }

        const task = get().getTaskById(taskId);
        
        if (!task) {
            throw new Error('Tarea no encontrada');
        }

        set((state) => {
            const updatedTasks = state.tasks.map((t) =>
                t.id === taskId ? { ...t, projectId: newProjectId, updatedAt: new Date() } : t
            );
            Storage.setItem(LOCAL_STORAGE_KEYS.TASKS, updatedTasks);
            return { tasks: updatedTasks };
        });
    },

    getTaskById: (id: string) => {
        return get().tasks.find((task) => task.id === id);
    },

    getTasksByProject: (projectId: string, includeArchived: boolean = false) => {
        return get().tasks.filter(
            task => task.projectId === projectId && (includeArchived || !task.isArchived)
        );
    },

    getActiveTasks: () => {
        return get().tasks.filter((task) => !task.isArchived);
    },

    getArchivedTasks: () => {
        return get().tasks.filter((task) => task.isArchived);
    },

}));

useTaskStore.getState().loadTasks();