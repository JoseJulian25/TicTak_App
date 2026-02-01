import { create } from 'zustand';
import { Client, CreateClientInput, Project, Task } from '@/types';
import { Storage } from '@/lib/storage';
import { LOCAL_STORAGE_KEYS, PREFIXES_ID } from '@/lib/constants';
import { generateId } from '@/lib/id-generator';


interface ClientStore {

  clients: Client[];
  isLoading: boolean;
  
  loadClients: () => void;
  addClient: (input: CreateClientInput) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  hardDeleteClient: (id: string) => void;
  archiveClient: (id: string) => void;
  restoreClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  getActiveClients: () => Client[];
  getArchivedClients: () => Client[];
}


export const useClientStore = create<ClientStore>((set, get) => ({
  clients: [],
  isLoading: false,


  loadClients: () => {
    const clients = Storage.getItem<Client[]>(LOCAL_STORAGE_KEYS.CLIENTS) || [];
    set({ clients });
  },


  addClient: (input: CreateClientInput) => {
    const newClient: Client = {
      id: generateId(PREFIXES_ID.CLIENT),
      name: input.name,
      color: input.color || '#3b82f6', 
      description: input.description || '',
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => {
      const updatedClients = [...state.clients, newClient];
      
      Storage.setItem(LOCAL_STORAGE_KEYS.CLIENTS, updatedClients);
      
      return { clients: updatedClients };
    });

    return newClient;
  },


  updateClient: (id: string, data: Partial<Client>) => {
    set((state) => {

      const updatedClients = state.clients.map((client) =>
        client.id === id ? { ...client, ...data, updatedAt: new Date()} : client
      );


      Storage.setItem(LOCAL_STORAGE_KEYS.CLIENTS, updatedClients);

      return { clients: updatedClients };
    });
  },


  deleteClient: (id: string) => {
    set((state) => {

      const updatedClients = state.clients.filter((client) => client.id !== id);

      Storage.setItem(LOCAL_STORAGE_KEYS.CLIENTS, updatedClients);

      return { clients: updatedClients };
    });
  },

  
  hardDeleteClient: (id: string) => {
    
    const { useProjectStore } = require('./useProjectStore');
    const { useTaskStore } = require('./useTaskStore');
    
    const projectStore = useProjectStore.getState();
    const clientProjects = projectStore.projects.filter((p: Project) => p.clientId === id);
    
    const taskStore = useTaskStore.getState();
    clientProjects.forEach((project: Project) => {
      const projectTasks = taskStore.tasks.filter((t: Task) => t.projectId === project.id);
      projectTasks.forEach((task: Task) => {
        taskStore.deleteTask(task.id);
      });
    });
    
    clientProjects.forEach((project: Project) => {
      projectStore.deleteProject(project.id);
    });

    get().deleteClient(id);
  },

  archiveClient: (id: string) => {
    set((state) => {
      const updatedClients = state.clients.map((client) =>
        client.id === id ? { ...client, isArchived: true, updatedAt: new Date() } : client
      );

      Storage.setItem(LOCAL_STORAGE_KEYS.CLIENTS, updatedClients);

      return { clients: updatedClients };
    });
  },

  restoreClient: (id: string) => {
    set((state) => {
      const updatedClients = state.clients.map((client) =>
        client.id === id ? { ...client, isArchived: false, updatedAt: new Date() } : client
      );

      Storage.setItem(LOCAL_STORAGE_KEYS.CLIENTS, updatedClients);

      return { clients: updatedClients };
    });
  },

  getClientById: (id: string) => {
    return get().clients.find((client) => client.id === id);
  },

  getActiveClients: () => {
    return get().clients.filter((client) => !client.isArchived);
  },

  getArchivedClients: () => {
    return get().clients.filter((client) => client.isArchived);
  },
}));


useClientStore.getState().loadClients();
