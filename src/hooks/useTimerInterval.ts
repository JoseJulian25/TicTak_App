import { useEffect } from 'react';
import { useTimerStore } from '@/stores/useTimerStore';

/**
 * Hook personalizado para manejar el interval del timer
 * 
 * Se encarga de:
 * - Crear un setInterval que llame a tick() cada segundo
 * - Limpiar el interval cuando el timer se pausa
 * - Limpiar el interval al desmontar el componente
 * - Prevenir memory leaks
 * 
 * @returns Estado actual del timer (elapsedSeconds, isRunning, isPaused)
 */
export const useTimerInterval = () => {
  const { isRunning, tick, elapsedSeconds, isPaused } = useTimerStore();

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = setInterval(() => {
      tick();
    }, 1000);

    // Cleanup: limpiar interval al desmontar o cuando isRunning cambie
    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning, tick]);

  return {
    elapsedSeconds,
    isRunning,
    isPaused,
  };
};
