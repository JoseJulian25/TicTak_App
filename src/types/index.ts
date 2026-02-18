/**
 * Barrel file - Re-exporta todos los tipos de la aplicación
 * 
 * Este archivo permite mantener la compatibilidad con imports existentes:
 * import { Client, Project } from '@/types'
 * 
 * También permite imports específicos si se prefiere:
 * import { Client } from '@/types/entities'
 */

// Entidades base
export * from './entities';

// Timer y sesiones activas
export * from './timer';

// Árbol de proyectos
export * from './tree';

// Tipos enriquecidos
export * from './enriched';

// Inputs para crear/actualizar
export * from './inputs';

// Módulo de estadísticas
export * from './stats';
