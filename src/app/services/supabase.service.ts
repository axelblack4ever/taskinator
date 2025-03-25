// src/app/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private _session = new BehaviorSubject<any>(null);

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );

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
      console.error('Error en consulta Supabase:', error);
      throw error;
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
      console.error(`Error insertando en ${table}:`, error);
      throw error;
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
      console.error(`Error actualizando en ${table}:`, error);
      throw error;
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
      console.error(`Error eliminando de ${table}:`, error);
      throw error;
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
      console.error(`Error obteniendo de ${table}:`, error);
      throw error;
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
      console.error(`Error obteniendo todos de ${table}:`, error);
      throw error;
    }
  }
}