// src/app/utils/vibration.ts

/**
 * Ejecuta una vibración breve si está habilitada y el navegador lo permite.
 * @param enabled true si el usuario ha activado la vibración
 */
export function vibrateIfEnabled(enabled: boolean): void {
  if (enabled && 'vibrate' in navigator) {
    navigator.vibrate([100]); // vibración corta de 100ms
  }
}