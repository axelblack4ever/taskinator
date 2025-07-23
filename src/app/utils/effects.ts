// src/app/utils/effects.ts

import { playSound } from './sound-player';
import { vibrateIfEnabled } from './vibration';
import { UserSettings } from '../models/user-settings.model';

/**
 * Ejecuta los efectos sensoriales (sonido y vibración) al completar una tarea,
 * en función de la configuración del usuario.
 *
 * @param settings configuración de usuario actual
 */
export function triggerCompletionEffects(settings: UserSettings): void {
  if (settings.sounds_enabled) {
    playSound(settings.sound_choice);
  }

  if (settings.vibration_enabled) {
    vibrateIfEnabled(true);
  }
}
