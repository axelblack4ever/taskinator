import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage)
  },
  {
    path: 'categories',
    loadComponent: () => import('./categories/categories.page').then( m => m.CategoriesPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('src/app/settings/settings.page').then(m => m.SettingsPage)
  },
  {
    path: 'new-task',
    loadComponent: () => import('./tasks/new-task/new-task.page').then( m => m.NewTaskPage)
  }
];
