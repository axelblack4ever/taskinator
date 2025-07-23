// src/app/services/settings.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { ErrorService } from './error.service';
import { UserSettings, UpdateUserSettingsRequest } from '../models/user-settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private _settings = new BehaviorSubject<UserSettings | null>(null);
  private _loading = new BehaviorSubject<boolean>(false);

  constructor(
    private supabase: SupabaseService,
    private errorService: ErrorService
  ) {}

  /** Observable con la configuración completa */
  get settings$(): Observable<UserSettings | null> {
    return this._settings.asObservable();
  }

  /** Observable para conocer si está cargando */
  get loading$(): Observable<boolean> {
    return this._loading.asObservable();
  }

  /** Getters individuales usando map */
  get theme$(): Observable<string | undefined> {
    return this.settings$.pipe(map(s => s?.theme));
  }

  get soundChoice$(): Observable<string | undefined> {
    return this.settings$.pipe(map(s => s?.sound_choice));
  }

  get soundsEnabled$(): Observable<boolean | undefined> {
    return this.settings$.pipe(map(s => s?.sounds_enabled));
  }

  get notificationsEnabled$(): Observable<boolean | undefined> {
    return this.settings$.pipe(map(s => s?.notifications_enabled));
  }

  get vibrationEnabled$(): Observable<boolean | undefined> {
    return this.settings$.pipe(map(s => s?.vibration_enabled));
  }

  get language$(): Observable<string | undefined> {
    return this.settings$.pipe(map(s => s?.language));
  }

  get methodsBehavior$(): Observable<string | undefined> {
    return this.settings$.pipe(map(s => s?.methods_behavior));
  }

  /** Cargar configuración del usuario actual */
  async loadSettings(): Promise<void> {
    this._loading.next(true);
    try {
      const { data: { session } } = await this.supabase.client.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        this._settings.next(null);
        return;
      }

      const { data, error } = await this.supabase.client
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('Row not found')) {
          // No existe registro, inicializar
          await this.initializeDefaults();
          return;
        }
        throw error;
      }

      this._settings.next(data as UserSettings);
    } catch (error) {
      const appError = this.errorService.handleError(error, { operation: 'loadSettings' });
      await this.errorService.showErrorMessage(appError);
      throw appError;
    } finally {
      this._loading.next(false);
    }
  }

  /** Crea una configuración inicial si no existe */
  async initializeDefaults(): Promise<void> {
    this._loading.next(true);
    try {
      const { data: { session } } = await this.supabase.client.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const defaultSettings: UserSettings = {
        user_id: userId,
        language: 'es',
        sounds_enabled: false,
        sound_choice: 'campanilla',
        notifications_enabled: false,
        vibration_enabled: false,
        theme: 'claro',
        methods_behavior: 'lista'
      };

      const created = await this.supabase.insert('user_settings', defaultSettings);
      this._settings.next(created as UserSettings);
    } catch (error) {
      const appError = this.errorService.handleError(error, { operation: 'initializeDefaults' });
      await this.errorService.showErrorMessage(appError);
      throw appError;
    } finally {
      this._loading.next(false);
    }
  }

  /** Actualiza la configuración */
  async updateSettings(updates: UpdateUserSettingsRequest): Promise<void> {
    this._loading.next(true);
    try {
      const current = this._settings.getValue();
      if (!current?.id) {
        throw new Error('No se ha cargado la configuración');
      }

      const updated = await this.supabase.update('user_settings', current.id, updates);
      this._settings.next({ ...current, ...updated });
    } catch (error) {
      const appError = this.errorService.handleError(error, { operation: 'updateSettings' });
      await this.errorService.showErrorMessage(appError);
      throw appError;
    } finally {
      this._loading.next(false);
    }
  }
}