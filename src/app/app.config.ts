// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// No necesitas importar IonicStorageModule

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Elimina la configuración de IonicStorage aquí
    // Si necesitas configurar SQLite, hazlo según la documentación específica del paquete que estés usando
  ]
};