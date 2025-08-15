// src/app/utils/notifications.ts

/**
 * Solicita permiso para mostrar notificaciones.
 * Solo se solicita si el permiso aún está en estado 'default'.
 * @returns El estado final del permiso ('granted', 'denied' o 'default')
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Las notificaciones no están soportadas en este navegador.');
    return 'denied';
  }

  const current = Notification.permission;

  if (current === 'default') {
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.warn('Error solicitando permiso de notificaciones:', error);
      return 'denied';
    }
  }

  return current;
}

/**
 * Muestra una notificación básica al completar una tarea,
 * si el usuario tiene las notificaciones habilitadas y ha concedido permisos.
 * @param enabled true si el usuario lo ha activado en la configuración
 */
export function showTaskCompletedNotification(enabled: boolean): void {
  if (!enabled) return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  new Notification('¡Tarea completada!', {
    body: 'Buen trabajo. Sigue así.',
    icon: 'assets/icon/icon.png' // Cambia este path si tienes otro icono
  });
}
