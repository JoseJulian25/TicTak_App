'use client';

import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useFaviconTimer } from '@/hooks/useFaviconTimer';

interface AppInitializerProps {
    children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
    const { isInitialized } = useAppInitialization();
    
    // Cambiar título dinámicamente según el estado del timer
    useFaviconTimer();

    if (!isInitialized) {
        return null;
    }

    return <>{children}</>;
}