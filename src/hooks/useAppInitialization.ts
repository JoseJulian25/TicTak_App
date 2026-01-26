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
        const initialize = () => {
            try {
                const hasClients = Storage.getItem(LOCAL_STORAGE_KEYS.CLIENTS) !== null;
                const hasProjects = Storage.getItem(LOCAL_STORAGE_KEYS.PROJECTS) !== null;
                const hasTasks = Storage.getItem(LOCAL_STORAGE_KEYS.TASKS) !== null;

                if (!hasClients || !hasProjects || !hasTasks) {
                    saveInitialData();
                }

                setIsInitialized(true);
            } catch (error) {
                console.error("Error during app initialization:", error);
                setIsInitialized(true);
            }
        }

        initialize();
    }, []);

    return { isInitialized };
}