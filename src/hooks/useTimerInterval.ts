import { useEffect } from 'react';
import { useTimerStore } from '@/stores/useTimerStore';

/**
 * Hook personalizado para manejar el interval del timer
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
