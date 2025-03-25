// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

export interface AuthUser {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
  app_metadata?: any;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUser;
}

export interface AuthResponse {
  session: AuthSession | null;
  user: AuthUser | null;
  error: any | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser = new BehaviorSubject<AuthUser | null>(null);
  private _authLoading = new BehaviorSubject<boolean>(true);
  private _authInitialized = new BehaviorSubject<boolean>(false);
  
  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {
    // Inicializar el estado de autenticación
    this.initializeAuth();
  }
  
  /**
   * Inicializa el estado de autenticación al cargar la aplicación
   */
  private async initializeAuth(): Promise<void> {
    try {
      this._authLoading.next(true);
      
      // Obtener la sesión actual
      const { data } = await this.supabase.client.auth.getSession();
      
      // Actualizar el BehaviorSubject con el usuario actual
      this._currentUser.next(data.session?.user || null);
      
      // Configurar el listener para cambios en la autenticación
      const { data: authListener } = this.supabase.client.auth.onAuthStateChange(
        (event, session) => {
          console.log('Auth state changed:', event);
          this._currentUser.next(session?.user || null);
          
          // Redirigir según el evento de autenticación
          if (event === 'SIGNED_IN') {
            this.router.navigate(['/tabs/today']);
          } else if (event === 'SIGNED_OUT') {
            this.router.navigate(['/login']);
          }
        }
      );
      
      this._authInitialized.next(true);
    } catch (error) {
      console.error('Error initializing auth:', error);
      this._currentUser.next(null);
    } finally {
      this._authLoading.next(false);
    }
  }
  
  /**
   * Registra un nuevo usuario con email y contraseña
   */
  async signUp(email: string, password: string, name?: string): Promise<AuthResponse> {
    try {
      this._authLoading.next(true);
      const { data, error } = await this.supabase.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0] // Usar nombre o primera parte del email
          }
        }
      });
      
      if (error) throw error;
      
      return {
        session: data.session ? { ...data.session, expires_at: data.session.expires_at ?? 0 } : null,
        user: data.user,
        error: null
      };
    } catch (error) {
      console.error('Error signing up:', error);
      return {
        session: null,
        user: null,
        error
      };
    } finally {
      this._authLoading.next(false);
    }
  }
  
  /**
   * Inicia sesión con email y contraseña
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      this._authLoading.next(true);
      const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return {
        session: data.session ? { ...data.session, expires_at: data.session.expires_at ?? 0 } : null,
        user: data.user,
        error: null
      };
    } catch (error) {
      console.error('Error signing in:', error);
      return {
        session: null,
        user: null,
        error
      };
    } finally {
      this._authLoading.next(false);
    }
  }
  
  /**
   * Cierra la sesión del usuario actual
   */
  async signOut(): Promise<boolean> {
    try {
      this._authLoading.next(true);
      const { error } = await this.supabase.client.auth.signOut();
      
      if (error) throw error;
      
      this._currentUser.next(null);
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    } finally {
      this._authLoading.next(false);
    }
  }
  
  /**
   * Envía un correo de restablecimiento de contraseña
   */
  async resetPassword(email: string): Promise<{ success: boolean; error: any }> {
    try {
      this._authLoading.next(true);
      const { error } = await this.supabase.client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error };
    } finally {
      this._authLoading.next(false);
    }
  }
  
  /**
   * Actualiza la contraseña del usuario
   */
  async updatePassword(password: string): Promise<{ success: boolean; error: any }> {
    try {
      this._authLoading.next(true);
      const { error } = await this.supabase.client.auth.updateUser({
        password
      });
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, error };
    } finally {
      this._authLoading.next(false);
    }
  }
  
  /**
   * Actualiza los datos del perfil del usuario
   */
  async updateProfile(data: { name?: string; avatar_url?: string }): Promise<{ success: boolean; error: any }> {
    try {
      this._authLoading.next(true);
      const { error } = await this.supabase.client.auth.updateUser({
        data
      });
      
      if (error) throw error;
      
      // Actualizar el usuario local
      const currentUser = this._currentUser.value;
      if (currentUser) {
        this._currentUser.next({
          ...currentUser,
          user_metadata: {
            ...(currentUser.user_metadata || {}),
            ...data
          }
        });
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error };
    } finally {
      this._authLoading.next(false);
    }
  }
  
  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): Observable<boolean> {
    return this._currentUser.asObservable().pipe(
      map(user => !!user)
    );
  }
  
  /**
   * Obtiene el usuario actual
   */
  get currentUser$(): Observable<AuthUser | null> {
    return this._currentUser.asObservable();
  }
  
  /**
   * Obtiene el estado de carga de la autenticación
   */
  get authLoading$(): Observable<boolean> {
    return this._authLoading.asObservable();
  }
  
  /**
   * Indica si la autenticación se ha inicializado
   */
  get authInitialized$(): Observable<boolean> {
    return this._authInitialized.asObservable();
  }
  
  /**
   * Verifica si el token actual es válido
   */
  async isTokenValid(): Promise<boolean> {
    try {
      const { data } = await this.supabase.client.auth.getSession();
      return !!data.session;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }
  
  /**
   * Fuerza la actualización del token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.client.auth.refreshSession();
      
      if (error) throw error;
      
      return !!data.session;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }
}