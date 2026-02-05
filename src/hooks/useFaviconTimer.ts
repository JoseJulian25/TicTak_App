import { useEffect, useRef } from 'react';
import { useTimerStore } from '@/stores/useTimerStore';

/**
 * Hook para cambiar dinámicamente el favicon según el estado del timer
 */
export function useFaviconTimer() {
  const isRunning = useTimerStore((state) => state.isRunning);

  useEffect(() => {
    // Buscar el elemento link del favicon
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    
    // Si no existe, crearlo
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      document.head.appendChild(link);
    }

    // Cambiar el favicon según el estado del timer
    if (isRunning) {
      link.href = '/favicon-active.svg';
    } else {
      link.href = '/favicon.svg';
    }
  }, [isRunning]);
}
