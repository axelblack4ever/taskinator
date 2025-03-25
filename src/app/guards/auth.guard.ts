// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.isAuthenticated().pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        // Guarda la URL a la que se intentaba acceder para redirigir después del login
        const redirectUrl = state.url !== '/login' ? state.url : '/tabs/today';
        router.navigate(['/login'], { queryParams: { redirectUrl } });
        return false;
      }
    })
  );
};

export const publicGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.isAuthenticated().pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      } else {
        // Si ya está autenticado, redirigir a la página principal
        router.navigate(['/tabs/today']);
        return false;
      }
    })
  );
};