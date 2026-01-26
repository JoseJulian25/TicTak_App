import { LOCAL_STORAGE_KEYS, PREFIXES_ID } from "@/lib/constants";
import { generateId } from "@/lib/id-generator";
import { Storage } from "@/lib/storage";
import { CreateTaskInput, Task } from "@/types";
import { create } from "zustand/react";
import { useProjectStore } from "./useProjectStore";

interface TaskStore {
    tasks: Task[];
    isLoading: boolean;

    loadTasks: () => void;
    addTask: (input: CreateTaskInput) => Task;
    updateTask: (id: string, data: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    getTaskById: (id: string) => Task | undefined;
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
        set((state) => {
            const updatedTasks = state.tasks.filter((task) => task.id !== id);
            Storage.setItem(LOCAL_STORAGE_KEYS.TASKS, updatedTasks);
            return { tasks: updatedTasks };
        });
    },

    getTaskById: (id: string) => {
        return get().tasks.find((task) => task.id === id);
    },

}));

useTaskStore.getState().loadTasks();