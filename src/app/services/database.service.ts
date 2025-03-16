// src/app/services/database.service.ts
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite!: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private isNative = Capacitor.isNativePlatform();
  
  // Nombre de la base de datos
  private readonly DATABASE_NAME = 'taskinator_db';

  constructor(private platform: Platform) {
    this.platform.ready().then(() => {
      this.initDatabase();
    });
  }

  async initDatabase() {
    try {
      // Crear conexión a SQLite
      this.sqlite = new SQLiteConnection(CapacitorSQLite);
      
      // Inicializar para web si es necesario
      if (!this.isNative) {
        // Solo necesario para entorno web
        await this.sqlite.initWebStore();
      }
      
      // Determinar si la conexión ya existe
      const isConnection = await this.sqlite.isConnection(this.DATABASE_NAME, false);
      
      if (isConnection.result) {
        // Recuperar conexión existente
        this.db = await this.sqlite.retrieveConnection(this.DATABASE_NAME, false);
      } else {
        // Crear nueva conexión
        this.db = await this.sqlite.createConnection(
          this.DATABASE_NAME,   // nombre de la BD 
          false,                // no es encriptada
          "no-encryption",      // modo de encriptación
          1,                    // versión
          false                 // modo de lectura
        );
      }
      
      // Abrir la base de datos
      await this.db.open();
      
      // Crear tablas si no existen
      await this.createTables();
      
      console.log('Database initialized successfully');
      this.dbReady.next(true);
      
    } catch (error) {
      console.error('Error initializing database', error);
    }
  }

  /**
   * Verificación de si la base de datos está lista
   */
  isDatabaseReady(): Observable<boolean> {
    return this.dbReady.asObservable();
  }

  /**
   * Creación de las tablas de la base de datos 
   */
  private async createTables() {
    try {
      // Tabla para tareas
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          category_id INTEGER,
          due_date TEXT,
          completed INTEGER DEFAULT 0,
          priority INTEGER DEFAULT 0,
          methodology TEXT,
          sync_status TEXT DEFAULT 'pending'
        )`);

      // Tabla para categorías
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          color TEXT
        )`);

      // Insertar categorías por defecto si no existen
      const categories = await this.db.query('SELECT COUNT(*) as count FROM categories');
      if (categories.values && categories.values[0] && categories.values[0].count === 0) {
        await this.db.execute(`
          INSERT INTO categories (name, color) VALUES
          ('Personal', '#FF5733'),
          ('Trabajo', '#33A1FF'),
          ('Estudios', '#33FF57')
        `);
      }

      // Creación de otras tablas necesarias: etiquetas, etc...
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
        )`);

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS task_tags (
          task_id INTEGER,
          tag_id INTEGER,
          PRIMARY KEY (task_id, tag_id),
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )`);
    } catch (error) {
      console.error('Error creating tables', error);
      throw error;
    }
  }

  /**
   * Obtener todas las tareas
   */
  async getAllTasks() {
    try {
      console.log('Getting all tasks');
      const result = await this.db.query(`
        SELECT t.*, c.name as category_name, c.color as category_color
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        ORDER BY t.due_date ASC`);
      console.log('Tasks retrieved:', result.values);
      return result.values || [];
    } catch (error) {
      console.error('Error getting all tasks', error);
      return [];
    }
  }
    
  /**
   * Obtener tareas por fecha
   */
  async getTasksByDate(date: string) {
    try {
      console.log('Getting tasks for date:', date);
      const result = await this.db.query(`
        SELECT t.*, c.name as category_name, c.color as category_color
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.due_date = ?
        ORDER BY t.priority DESC, t.title ASC`, [date]);
      console.log('Tasks found:', result.values);
      return result.values || [];
    } catch (error) {
      console.error('Error getting tasks by date', error);
      return [];
    }
  }

  /**
   * Agregar una nueva tarea
   */
  async addTask(task: {
    title: string,
    description?: string,
    category_id?: number | null,
    due_date?: string,
    priority?: number,
    methodology?: string | null;
  }) {
    try {
      console.log('Adding task:', task);
      const result = await this.db.run(`
        INSERT INTO tasks (title, description, category_id, due_date, priority, methodology)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          task.title,
          task.description || '',
          task.category_id || null,
          task.due_date || null,
          task.priority || 0,
          task.methodology || null
        ]);
      console.log('Task added, result:', result);
      return result;
    } catch (error) {
      console.error('Error adding task', error);
      throw error;
    }
  }

  /**
   * Actualizar una tarea existente
   */
  async updateTask(id: number, taskData: any) {
    try {
      console.log('Updating task:', id, taskData);
      const fields = Object.keys(taskData)
        .filter(key => key !== 'id' && taskData[key] !== undefined)
        .map(key => `${key} = ?`);

      const values = Object.keys(taskData)
        .filter(key => key !== 'id' && taskData[key] !== undefined)
        .map(key => taskData[key]);

      if (fields.length === 0) {
        return false;
      }

      const query = 'UPDATE tasks SET ' + fields.join(', ') + ' WHERE id = ?';
      values.push(id);
      
      const result = await this.db.run(query, values);
      const success = (result.changes?.changes ?? 0) > 0;
      console.log('Task updated, success:', success);
      return success;
    } catch (error) {
      console.error('Error updating task', error);
      return false;
    }
  }

  /**
   * Eliminar una tarea
   */
  async deleteTask(id: number) {
    try {
      console.log('Deleting task:', id);
      // Primero eliminamos las relaciones en task_tags
      await this.db.run('DELETE FROM task_tags WHERE task_id = ?', [id]);

      // Luego eliminamos la tarea
      const result = await this.db.run('DELETE FROM tasks WHERE id = ?', [id]);
      const success = (result.changes?.changes ?? 0) > 0;
      console.log('Task deleted, success:', success);
      return success;
    } catch (error) {
      console.error('Error deleting task', error);
      return false;
    }
  }

  /**
   * Marcar una tarea como sincronizada
   */
  async markAsSynced(id: number) {
    try {
      console.log('Marking task as synced:', id);
      const result = await this.db.run('UPDATE tasks SET sync_status = "synced" WHERE id = ?', [id]);
      const success = (result.changes?.changes ?? 0) > 0;
      console.log('Task marked as synced, success:', success);
      return success;
    } catch (error) {
      console.error('Error marking task as synced', error);
      return false;
    }
  }

  /**
   * Obtener todas las categorías
   */
  async getAllCategories() {
    try {
      console.log('Getting all categories');
      const result = await this.db.query('SELECT * FROM categories');
      console.log('Categories retrieved:', result.values);
      return result.values || [];
    } catch (error) {
      console.error('Error getting categories', error);
      return [];
    }
  }

  /**
   * Cerrar la conexión a la base de datos
   */
  async closeConnection() {
    try {
      if (this.db) {
        await this.db.close();
        console.log('Database connection closed');
      }
    } catch (error) {
      console.error('Error closing database connection', error);
    }
  }
}