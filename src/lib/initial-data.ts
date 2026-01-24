import { LOCAL_STORAGE_KEYS, PREFIXES_ID } from './constants';
import { Client, Project, Task } from '../types/index';
import { generateId } from './id-generator';

export interface InitialData {
    clients: Client[];
    projects: Project[];
    tasks: Task[];
}

function createInitialClient(): Client {
    const id = generateId(PREFIXES_ID.CLIENT);
    return {
        id,
        name: 'Personal',
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false
    };
}

function createInitialProject(clientId: string): Project {
    const id = generateId(PREFIXES_ID.PROJECT);
    return {
        id,
        name: 'General',
        clientId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false
    };
}

function createInitialTask(projectId: string): Task {
    const id = generateId(PREFIXES_ID.TASK);
    return {
        id,
        name: 'Trabajo en curso',
        projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        isCompleted: false
    };
}

export function getInitialData(): InitialData {
    const client = createInitialClient();
    const project = createInitialProject(client.id);
    const task = createInitialTask(project.id);

    return {
        clients: [client],   
        projects: [project],  
        tasks: [task]         
    };
}

export function saveInitialData(): void {
    const data: InitialData = getInitialData();
    
    localStorage.setItem(LOCAL_STORAGE_KEYS.CLIENTS, JSON.stringify(data.clients));
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
    localStorage.setItem(LOCAL_STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
}