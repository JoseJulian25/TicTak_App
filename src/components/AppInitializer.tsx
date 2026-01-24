'use client';

import { useAppInitialization } from '@/hooks/useAppInitialization';

interface AppInitializerProps {
    children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
    const { isInitialized } = useAppInitialization();

    if (!isInitialized) {
        return null;
    }

    return <>{children}</>;
}