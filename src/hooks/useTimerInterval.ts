import { useEffect } from 'react';
import { useTimerStore } from '@/stores/useTimerStore';

/**
 * Hook personalizado para manejar el interval del timer
 */
export const useTimerInterval = () => {
  const isRunning = useTimerStore((state) => state.isRunning);
  const isPaused = useTimerStore((state) => state.isPaused);
  const tick = useTimerStore((state) => state.tick);
  const getElapsedSeconds = useTimerStore((state) => state.getElapsedSeconds);

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
    elapsedSeconds: getElapsedSeconds(),
    isRunning,
    isPaused,
  };
};
