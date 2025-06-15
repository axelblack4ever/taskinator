// src/app/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { ErrorService, ErrorType } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private _session = new BehaviorSubject<any>(null);

  constructor(private errorService: ErrorService) {
    const { url, anonKey } = environment.supabase;

// Inicialización personalizada del cliente de Supabase desactivando el sistema de locking entre pestañas.
// Supabase usa por defecto la API Web Locks (`navigator.locks`) para evitar conflictos al acceder al token de sesión
// cuando se abren varias pestañas simultáneamente. Sin embargo, en algunos navegadores o entornos puede dar errores.
//
// Para evitar estos problemas, proporcionamos una función `lock` que ignora el bloqueo real:
// simplemente ejecuta el `callback()` directamente, sin esperar ni competir por el control.
// Esta función sigue la firma esperada por Supabase: `(key, acquireTimeout, callback)`.
//
// Esta solución es válida siempre que no se requiera sincronización de sesión entre pestañas.
// Si en el futuro se necesita esa funcionalidad, se puede eliminar este `lock` personalizado
// para volver al comportamiento por defecto de Supabase.
    this.supabase = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        lock: async (_key: string, _acquireTimeout: number, callback: () => Promise<any>) => {
          return await callback();
        }
      }
    });

    // Intentar recuperar sesión al iniciar
    this.supabase.auth.getSession().then(({ data }) => {
      this._session.next(data.session);
    });

    // Escuchar cambios en la autenticación
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session.next(session);
    });
  }

  /**
   * Obtiene el cliente de Supabase
   */
  get client(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Observable que emite la sesión actual
   */
  session(): Observable<any> {
    return this._session.asObservable();
  }

  /**
   * Ejecuta una consulta a la base de datos utilizando el constructor de consultas de Supabase
   * @param table Nombre de la tabla
   * @param queryBuilder Función que construye la consulta
   * @returns Promesa con el resultado de la consulta
   */
  async query(table: string, queryBuilder: (query: any) => any): Promise<any> {
    try {
      const query = this.supabase.from(table);
      const builtQuery = queryBuilder(query);
      const { data, error } = await builtQuery;
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      const appError = this.errorService.handleError(error, { 
        operation: 'query', 
        table 
      });
      throw appError;
    }
  }

  /**
   * Inserta un registro en la tabla especificada
   * @param table Nombre de la tabla
   * @param record Datos a insertar
   * @returns Promesa con el registro insertado
   */
  async insert(table: string, record: any): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .insert(record)
        .select();
      
      if (error) {
        throw error;
      }
      
      return data[0];
    } catch (error) {
      const appError = this.errorService.handleError(error, { 
        operation: 'insert', 
        table, 
        record 
      });
      throw appError;
    }
  }

  /**
   * Actualiza un registro en la tabla especificada
   * @param table Nombre de la tabla
   * @param id ID del registro a actualizar
   * @param updates Datos a actualizar
   * @returns Promesa con el registro actualizado
   */
  async update(table: string, id: number, updates: any): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        throw error;
      }
      
      return data[0];
    } catch (error) {
      const appError = this.errorService.handleError(error, { 
        operation: 'update', 
        table, 
        id, 
        updates 
      });
      throw appError;
    }
  }

  /**
   * Elimina un registro de la tabla especificada
   * @param table Nombre de la tabla
   * @param id ID del registro a eliminar
   * @returns Promesa con el resultado de la operación
   */
  async delete(table: string, id: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      const appError = this.errorService.handleError(error, { 
        operation: 'delete', 
        table, 
        id 
      });
      throw appError;
    }
  }

  /**
   * Obtiene un registro específico por su ID
   * @param table Nombre de la tabla
   * @param id ID del registro
   * @returns Promesa con el registro encontrado
   */
  async getById(table: string, id: number): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      const appError = this.errorService.handleError(error, { 
        operation: 'getById', 
        table, 
        id 
      });
      throw appError;
    }
  }

  /**
   * Obtiene todos los registros de una tabla
   * @param table Nombre de la tabla
   * @returns Promesa con los registros encontrados
   */
  async getAll(table: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .select('*');
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      const appError = this.errorService.handleError(error, { 
        operation: 'getAll', 
        table 
      });
      throw appError;
    }
  }
}