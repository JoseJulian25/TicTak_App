'use client';

import { Storage } from "@/lib/storage";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { useEffect, useState } from "react";
import { saveInitialData } from "@/lib/initial-data";


/**
 * Hook para inicializar la aplicación
 * 
 * 
 */
export function useAppInitialization() {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initialize = async () => {
            try {
                // Mínimo 300ms para evitar flash de skeleton
                const startTime = Date.now();
                
                const hasClients = Storage.getItem(LOCAL_STORAGE_KEYS.CLIENTS) !== null;
                const hasProjects = Storage.getItem(LOCAL_STORAGE_KEYS.PROJECTS) !== null;
                const hasTasks = Storage.getItem(LOCAL_STORAGE_KEYS.TASKS) !== null;

                if (!hasClients || !hasProjects || !hasTasks) {
                    saveInitialData();
                } else {
                }

                // Esperar al menos 300ms para evitar flash
                const elapsed = Date.now() - startTime;
                const minimumDelay = 300;
                if (elapsed < minimumDelay) {
                    await new Promise(resolve => setTimeout(resolve, minimumDelay - elapsed));
                }

                setIsInitialized(true);
            } catch (error) {
                console.error("Error during app initialization:", error);
                setIsInitialized(true); // Aún así inicializar
            }
        }

        initialize();
    }, []);

    return { isInitialized };
}