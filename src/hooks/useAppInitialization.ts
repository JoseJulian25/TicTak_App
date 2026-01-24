'use client';

import { storage } from "@/lib/storage";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { useEffect, useState } from "react";
import { saveInitialData } from "@/lib/initial-data";



export function useAppInitialization() {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initialize = () => {
            try {
                const hasClients = storage.getItem(LOCAL_STORAGE_KEYS.CLIENTS) !== null;
                const hasProjects = storage.getItem(LOCAL_STORAGE_KEYS.PROJECTS) !== null;
                const hasTasks = storage.getItem(LOCAL_STORAGE_KEYS.TASKS) !== null;

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