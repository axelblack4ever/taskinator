// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage),
    canActivate: [publicGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage),
    canActivate: [authGuard]
  },
  {
    path: 'categories',
    loadComponent: () => import('./categories/categories.page').then(m => m.CategoriesPage),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then(m => m.SettingsPage),
    canActivate: [authGuard]
  },
  {
    path: 'new-task',
    loadComponent: () => import('./tasks/new-task/new-task.page').then(m => m.NewTaskPage),
    canActivate: [authGuard]
  },
  // Ruta de comodín para redirigir al inicio de sesión
  {
    path: '**',
    redirectTo: 'login'
  },  {
    path: 'pomodoro',
    loadComponent: () => import('./methodologies/pomodoro/pomodoro.page').then( m => m.PomodoroPage)
  },
  {
    path: 'three-three-three',
    loadComponent: () => import('./methodologies/three-three-three/three-three-three.page').then( m => m.ThreeThreeThreePage)
  }

];