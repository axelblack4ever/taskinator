// src/app/tabs/tabs.routes.ts
import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'today',
        loadComponent: () => import('../today/today.page').then(m => m.TodayPage)
      },
      {
        path: 'tasks',
        loadComponent: () => import('../tasks/tasks.page').then(m => m.TasksPage)
      },
      {
        path: 'tasks/new',
        loadComponent: () => import('../tasks/new-task/new-task.page').then(m => m.NewTaskPage)
      },
      {
        path: 'methodologies',
        loadComponent: () => import('../methodologies/methodologies.page').then(m => m.MethodologiesPage)
      },
      {
        path: 'statistics',
        loadComponent: () => import('../statistics/statistics.page').then(m => m.StatisticsPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('../profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: 'categories',
        loadComponent: () => import('../categories/categories.page').then(m => m.CategoriesPage)
      },
      {
        path: 'settings',
        loadComponent: () => import('../settings/settings.page').then(m => m.SettingsPage)
      },       
      {
        path: '',
        redirectTo: '/tabs/today',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/today',
    pathMatch: 'full'
  }
];