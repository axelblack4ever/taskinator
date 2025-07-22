// src/app/utils/sound-player.ts
import { SOUND_OPTIONS } from '../constants/sound-options';

/**
 * Reproduce el sonido seleccionado si está definido.
 * @param soundKey clave correspondiente a la opción (ej. 'campanilla', 'eco', etc.)
 */
export function playSound(soundKey: string): void {
  const option = SOUND_OPTIONS.find(opt => opt.value === soundKey);

  if (option?.file) {
    const audio = new Audio(`assets/sounds/${option.file}`);
    audio.play().catch((e) => {
      console.warn('No se pudo reproducir el sonido:', e);
    });
  }
}
