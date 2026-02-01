import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/time-utils';
import { Clock, AlertCircle } from 'lucide-react';

interface RecoveryDecisionModalProps {
  isOpen: boolean;
  timeUntilClose: number;
  timeTotal: number;
  onDecision: (choice: 'until-close' | 'full-time') => void;
}

/**
 * Modal de Decisión de Recuperación
 * 
 * Se muestra cuando se detecta que la app estuvo suspendida por más del umbral
 * permitido (por defecto 3 minutos). Permite al usuario elegir qué tiempo registrar.
 * 
 * Opciones:
 * 1. "Hasta el cierre" - Cuenta solo el tiempo antes de que se suspendiera
 * 2. "Tiempo completo" - Cuenta todo el tiempo incluyendo suspensión
 */
export function RecoveryDecisionModal({
  isOpen,
  timeUntilClose,
  timeTotal,
  onDecision,
}: RecoveryDecisionModalProps) {
  const gapDetected = timeTotal - timeUntilClose;

  return (
    <Dialog open={isOpen} modal>
      <DialogContent 
        className="sm:max-w-[500px]"
        // Modal no dismissible - usuario debe elegir
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Sesión de Timer Detectada
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Explicación */}
          <div className="text-sm text-muted-foreground">
            <p>
              Detectamos que tenías un timer activo. La app estuvo inactiva por{' '}
              <strong className="text-foreground">{formatDuration(gapDetected)}</strong>.
            </p>
            <p className="mt-2">
              ¿Qué tiempo deseas registrar?
            </p>
          </div>

          {/* Opción 1: Tiempo hasta el cierre */}
          <button
            onClick={() => onDecision('until-close')}
            className="w-full text-left p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-accent transition-colors"
          >
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-foreground mb-1">
                  Tiempo hasta el cierre
                </div>
                <div className="text-2xl font-bold text-primary mb-2">
                  {formatDuration(timeUntilClose)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Registra solo el tiempo que trabajaste antes de que se cerrara la app.
                  <span className="block mt-1 text-xs">
                    ⏱️ Recomendado si dejaste la app abierta sin trabajar
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Opción 2: Tiempo completo */}
          <button
            onClick={() => onDecision('full-time')}
            className="w-full text-left p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-accent transition-colors"
          >
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-foreground mb-1">
                  Tiempo completo
                </div>
                <div className="text-2xl font-bold text-blue-500 mb-2">
                  {formatDuration(timeTotal)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Registra todo el tiempo incluyendo cuando la app estuvo cerrada.
                  <span className="block mt-1 text-xs">
                    ⏱️ Úsalo si seguiste trabajando offline o en otra app
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
