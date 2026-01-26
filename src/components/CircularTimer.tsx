import { memo } from "react";
import { motion } from "motion/react";

interface CircularTimerProps {
  seconds: number;
  isRunning: boolean;
}

/**
 * Componente de presentación para el timer circular
 * 
 * Componente puro que solo recibe props y renderiza.
 * No maneja estado interno ni lógica de negocio.
 * 
 * Optimizado con React.memo para evitar re-renders innecesarios.
 */
export const CircularTimer = memo(function CircularTimer({ 
  seconds, 
  isRunning 
}: CircularTimerProps) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const formatTime = (h: number, m: number, s: number) => {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Calcular el progreso del círculo (resetea cada hora)
  const maxSeconds = 3600; // 1 hora
  const progress = (seconds % maxSeconds) / maxSeconds;
  const circumference = 2 * Math.PI * 140; // radio de 140
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* SVG del círculo de progreso */}
      <svg className="w-64 h-64 md:w-80 md:h-80 -rotate-90" viewBox="0 0 320 320">
        {/* Círculo de fondo */}
        <circle
          cx="160"
          cy="160"
          r="140"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
          className="dark:stroke-gray-700"
        />
        
        {/* Círculo de progreso */}
        <motion.circle
          cx="160"
          cy="160"
          r="140"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        
        {/* Gradiente para el círculo */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Contenido central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl md:text-6xl font-light tracking-tight text-gray-900 dark:text-gray-100 mb-2">
          {formatTime(hours, minutes, secs)}
        </div>
        
        {/* Indicador de estado */}
        {isRunning && (
          <motion.div
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-green-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            En progreso
          </motion.div>
        )}
      </div>
    </div>
  );
});
