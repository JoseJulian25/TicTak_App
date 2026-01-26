import { create } from 'zustand';
import { Client, CreateClientInput } from '@/types';
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
  getClientById: (id: string) => Client | undefined;
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
        client.id === id
          ? { ...client, ...data, updatedAt: new Date()}
          : client
      );


      Storage.setItem(LOCAL_STORAGE_KEYS.CLIENTS, updatedClients);

      return { clients: updatedClients };
    });
  },


  deleteClient: (id: string) => {
    set((state) => {

      // Soft delete: solo marcar como archivado
      const updatedClients = state.clients.map((client) =>
        client.id === id
          ? { ...client, isArchived: true, updatedAt: new Date()}
          : client
      );

      Storage.setItem(LOCAL_STORAGE_KEYS.CLIENTS, updatedClients);

      return { clients: updatedClients };
    });
  },


  getClientById: (id: string) => {
    return get().clients.find((client) => client.id === id);
  },
}));


useClientStore.getState().loadClients();
