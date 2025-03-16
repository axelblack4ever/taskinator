// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Inicializar SQLite para web si es necesario
const initializeApp = async () => {
  if (!Capacitor.isNativePlatform()) {
    try {
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      await sqlite.initWebStore();
      console.log('SQLite web store initialized');
    } catch (error) {
      console.error('Error initializing SQLite web store:', error);
    }
  }
  
  bootstrapApplication(AppComponent, {
    providers: [
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      provideIonicAngular(),
      provideRouter(routes, withPreloading(PreloadAllModules)),
    ],
  });
};

initializeApp();