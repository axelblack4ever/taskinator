// src/app/utils/effects.ts

import { playSound } from './sound-player';
import { vibrateIfEnabled } from './vibration';
import { UserSettings } from '../models/user-settings.model';
import { showTaskCompletedNotification } from './notifications';

/**
 * Ejecuta los efectos sensoriales (sonido y vibración) al completar una tarea,
 * en función de la configuración del usuario.
 *
 * @param settings configuración de usuario actual
 */
export function triggerCompletionEffects(settings: UserSettings): void {
    // Verifica que las configuraciones de usuario estén definidas
    if (!settings) {
        console.warn('No se proporcionaron configuraciones de usuario para los efectos de finalización.');
        return;
    }
    /**
     * Reproduce el sonido y la vibración si están habilitados en la configuración del usuario.
      * @param settings configuración de usuario actual
     */
    if (settings.sounds_enabled) {
        playSound(settings.sound_choice);
    }

    /**
     * Vibra el dispositivo si la vibración está habilitada.
     *  @param settings configuración de usuario actual
     */
    if (settings.vibration_enabled) {
        vibrateIfEnabled(true);
    }
    /**
     * Muestra una notificación de tarea completada si las notificaciones están habilitadas y se ha concedido permiso.
     * @param settings configuración de usuario actual
     */
    if (settings.notifications_enabled) {
        showTaskCompletedNotification(true);
    }
}
