import { Injectable } from '@angular/core';
import { Platform} from '@ionic/angular/standalone'
import { Capacitor} from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject, catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private sqlite!: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(private platform: Platform) {
      this.platform.ready().then(() => {
        this.initDabase();
      });
     }

     /**
      * Inicialización de la base de datos
      */
  async initDabase() {
    if (this.platform.is('capacitor')) {
      try {
        this.sqlite = new SQLiteConnection(CapacitorSQLite);
        this.db = await this.sqlite.createConnection("taskinator_db", false, "no-encryption", 1, false);
        await this.db.open();

        // Creación de las tablas necesarias
        await this.createTables();

        // Notificación que la base de datos está lista
      } catch (error: any) {
        console.warn('Error al abrir la base de datos', error);
      }
    } else {
      // Estamos en desarrollo web, usar una versión alternativa
      // o proporcionar un mock para pruebas
      console.warn('SQLite no disponible en web, usando mock para desarrollo');
      // Aquí podrías implementar un almacenamiento alternativo para desarrollo
      this.dbReady.next(true);
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
        methdology TEXT,
        sync_status TEXT DEFAULT 'pending',
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
        id integer primary key autoincrement,
        name text not UNIQUE
      )`);

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS task_tags (
        task_id integer,
        tag_id integer,
        primary key (task_id, tag_id),
        foreign key (task_id) references tasks(id) ON DELETE CASCADE,
        foreign key (tag_id) references tags(id) ON DELETE CASCADE
      )`);
    }

    /**
     * Obtener todas las tareas
     */
    async getAllTasks() {
      try {
        const result = await this.db.query(`
          SELECT t.*, c.name as category_name, c.color as category_color
          FROM tasks t
          LEFT JOIN categories c ON t.category_id = c.id
          ORDER BY t.due_date ASC`);
        return result.values;
      } catch (error: unknown) {
        console.error('Error al obtener las tareas', error);
        return [];
      }
    }
    
    /**
     * Obtener tareas por fecha
     */
    async getTasksByDate(date: string) {
      try {
        const result = await this.db.query(`
          SELECT t.*, c.name as category_name, c.color as category_color
          FROM tasks t
          LEFT JOIN categories c ON t.category_id = c.id
          WHERE t.due_date = ?
          ORDER BY t.due_date ASC`, [date]);
        return result.values;
      } catch (error: unknown) {
        console.error('Error al obtener las tareas', error);
        return [];
      }
    }

    /**
     * Agregar una nueva tarea
     */
    async addTask(task: {
      title: string,
      description?: string,
      category_id?: number,
      due_date?: string,
      priority?: number,
      methodology?: string;
    }) {
      try {
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
      } catch (error: unknown) {
        console.error('Error al agregar la tarea', error);
      }

    };

    /**
     * Actualizar una tarea existente
     */
    async updateTask(id: number, taskData: any) {
      try  {
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
        return result.changes && result.changes.changes !== undefined && result.changes.changes > 0;
      } catch (error: unknown) {
        console.error('Error al actualizar la tarea', error);
        return false;
      }
    }

    /**
     * Eliminar una tarea
     */
    async deleteTask(id: number) {
      // Primero eliminamos las relaciones en task_tags
      await this.db.run('DELETE FROM task_tags WHERE task_id = ?', [id]);

      // Luego eliminamos la tarea
      const result = await this.db.run('DELETE FROM tasks WHERE id = ?', [id]);
      return result.changes && result.changes.changes !== undefined && result.changes.changes > 0;
    } catch (error: unknown) {
      console.error('Error al eliminar la tarea', error);
      return false;
    }

    /**
     * Marcar una tarea como sincronizada
     */
    async markAsSynced(id: number) {
      try {
        const result = await this.db.run('UPDATE tasks SET sync_status = "synced" WHERE id = ?', [id]);
        return result.changes && result.changes.changes !== undefined && result.changes.changes > 0;
      } catch (error) {
        console.error('Error al marcar la tarea como sincronizada', error);
        return false;
      }
    }

    /**
     * Obtener todas las categorías
     */
    async getAllCategories() {
      try {
        const result = await this.db.query('SELECT * FROM categories');
        return result.values || [];
      } catch (error: unknown) {
        console.error('Error al obtener las categorías', error);
        return [];
      }
    }

    /**
     * Cerrar la conexión a la base de datos
     */
    async closeConnection() {
      await this.db.close();
    }




  }
