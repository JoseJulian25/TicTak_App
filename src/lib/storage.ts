// ========================================
// UTILIDAD PARA LOCALSTORAGE
// ========================================

const isClient = typeof window !== "undefined";

/**
 * Lee un valor del localStorage y lo deserializa
 * @param key - Clave del item a leer
 * @returns El valor deserializado o null si no existe o hay error
 * 
 */
export function getItem<T>(key: string): T | null {
  if (!isClient) {
    console.warn(`localStorage.getItem called on server for key: ${key}`);
    return null;
  }

  try {
    const item = window.localStorage.getItem(key);
    
    if (item === null) {
      return null;
    }

    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage (key: ${key}):`, error);
    return null;
  }
}

/**
 * Guarda un valor en localStorage serializado como JSON
 * @param key - Clave bajo la cual guardar
 * @param value - Valor a guardar (será serializado con JSON.stringify)
 * @returns true si se guardó exitosamente, false si hubo error
 * 
 */
export function setItem<T>(key: string, value: T): boolean {
  if (!isClient) {
    console.warn(`localStorage.setItem called on server for key: ${key}`);
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    
    window.localStorage.setItem(key, serialized);
    
    return true;
  } catch (error) {
    
    if (error instanceof Error) {
      if (error.name === "QuotaExceededError") {
        console.error(`localStorage quota exceeded for key: ${key}`);
      } else if (error.name === "SecurityError") {
        console.error(`localStorage access denied (SecurityError) for key: ${key}`);
      } else {
        console.error(`Error writing to localStorage (key: ${key}):`, error);
      }
    }
    
    return false;
  }
}

/**
 * Elimina un item específico del localStorage
 * @param key - Clave del item a eliminar
 * @returns true si se eliminó exitosamente, false si hubo error
 * 
 */
export function removeItem(key: string): boolean {
  if (!isClient) {
    console.warn(`localStorage.removeItem called on server for key: ${key}`);
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Limpia todo el localStorage
 * @returns true si se limpió exitosamente, false si hubo error
 * 
 */
export function clear(): boolean {
  if (!isClient) {
    console.warn("localStorage.clear called on server");
    return false;
  }

  try {
    window.localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
}

/**
 * Verifica si una clave existe en localStorage
 * @param key - Clave a verificar
 * @returns true si existe, false si no
 * 
 */
export function hasItem(key: string): boolean {
  if (!isClient) {
    return false;
  }

  try {
    return window.localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking localStorage key: ${key}`, error);
    return false;
  }
}

/**
 * Obtiene todas las claves almacenadas en localStorage
 * @returns Array de claves
 * 
 */
export function getAllKeys(): string[] {
  if (!isClient) {
    return [];
  }

  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key !== null) {
        keys.push(key);
      }
    }
    return keys;
  } catch (error) {
    console.error("Error getting localStorage keys:", error);
    return [];
  }
}
