'use client';

import { Storage } from "@/lib/storage";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { useEffect, useState } from "react";
import { saveInitialData } from "@/lib/initial-data";


/**
 * Hook para inicializar la aplicación
 * 
 * Se encarga de:
 * - Verificar si es la primera vez que se carga la app
 * - Si es la primera vez, crear datos iniciales (clientes, proyectos, tareas)
 * 
 * @returns Estado de inicialización de la app
 * 
 */
export function useAppInitialization() {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initialize = () => {
            try {
                const hasClients = Storage.getItem(LOCAL_STORAGE_KEYS.CLIENTS) !== null;
                const hasProjects = Storage.getItem(LOCAL_STORAGE_KEYS.PROJECTS) !== null;
                const hasTasks = Storage.getItem(LOCAL_STORAGE_KEYS.TASKS) !== null;

                // Si no hay datos, crear estructura inicial
                if (!hasClients || !hasProjects || !hasTasks) {
                    console.log('Primera vez: creando datos iniciales...');
                    saveInitialData();
                } else {
                    console.log('Ya hay datos, saltando inicialización');
                }

                setIsInitialized(true);
            } catch (error) {
                console.error("Error during app initialization:", error);
            }
        }

        initialize();
    }, []);

    return { isInitialized };
}