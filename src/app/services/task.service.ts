// src/app/services/task.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { ErrorService } from './error.service';
import { 
  Task, 
  TaskPriority, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskDetailResponse 
} from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private _tasks = new BehaviorSubject<Task[]>([]);
  private _todayTasks = new BehaviorSubject<TaskDetailResponse[]>([]);
  private _loading = new BehaviorSubject<boolean>(false);

  constructor(
    private supabase: SupabaseService,
    private errorService: ErrorService
  ) { }

  /**
   * Carga todas las tareas del usuario actual
   */
  async loadTasks(): Promise<void> {
    this._loading.next(true);
    try {
      const data = await this.supabase.query('tasks', query => 
        query.select('*').order('created_at', { ascending: false })
      );
      this._tasks.next(data);
    } catch (error) {
      const appError = this.errorService.handleError(error, { operation: 'loadTasks' });
      await this.errorService.showErrorMessage(appError);
      throw appError;
    } finally {
      this._loading.next(false);
    }
  }

  /**
   * Carga las tareas para hoy (utilizando la vista today_tasks)
   */
  async loadTodayTasks(): Promise<void> {
    this._loading.next(true);
    try {
      const data = await this.supabase.query('today_tasks', query => 
        query.select('*').order('priority', { ascending: false })
      );
      
      // Procesar los datos para asegurar compatibilidad con la interfaz
      const processedData: TaskDetailResponse[] = data.map((task: TaskDetailResponse) => {
        // Asegurarse de que category_name y category_color estén disponibles
        if (task.category && !task.category_name) {
          task.category_name = task.category.name;
          task.category_color = task.category.color;
        }
        return task;
      });
      
      this._todayTasks.next(processedData);
    } catch (error) {
      const appError = this.errorService.handleError(error, { operation: 'loadTodayTasks' });
      await this.errorService.showErrorMessage(appError);
      throw appError;
    } finally {
      this._loading.next(false);
    }
  }

  /**
   * Obtiene una tarea específica por su ID con información detallada
   */
  async getTaskDetails(taskId: number): Promise<TaskDetailResponse | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('task_details')
        .select('*')
        .eq('id', taskId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      const appError = this.errorService.handleError(error, { 
        operation: 'getTaskDetails',
        taskId
      });
      await this.errorService.showErrorMessage(appError);
      throw appError;
    }
  }

  /**
   * Crea una nueva tarea
   */
  async createTask(taskRequest: CreateTaskRequest): Promise<Task> {
    this._loading.next(true);
    try {
      // Obtener el ID del usuario actual
      const { data: { session } } = await this.supabase.client.auth.getSession();
      
      if (!session?.user) {
        throw new Error('Usuario no autenticado');
      }
      
      // Aseguramos que se establecen los valores predeterminados
      const newTask: Task = {
        ...taskRequest,
        completed: taskRequest.completed ?? false,
        priority: taskRequest.priority ?? TaskPriority.Low,
        is_important: taskRequest.is_important ?? false,
        is_frog: taskRequest.is_frog ?? false,
        created_at: new Date().toISOString(),
        user_id: session.user.id  // Agregar el ID del usuario actual
      };
      
      const createdTask = await this.supabase.insert('tasks', newTask);
      
      // Actualizamos el estado local
      const currentTasks = this._tasks.value;
      this._tasks.next([createdTask, ...currentTasks]);
      
      return createdTask;
    } catch (error) {
      const appError = this.errorService.handleError(error, { 
        operation: 'createTask',
        taskRequest 
      });
      await this.errorService.showErrorMessage(appError);
      throw appError;
    } finally {
      this._loading.next(false);
    }
  }

  /**
   * Actualiza una tarea existente
   */
  async updateTask(taskId: number, updates: UpdateTaskRequest): Promise<Task> {
    this._loading.next(true);
    try {
      const updatedTask = await this.supabase.update('tasks', taskId, updates);
      
      // Actualizamos el estado local
      const currentTasks = this._tasks.value;
      const updatedTasks = currentTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      );
      this._tasks.next(updatedTasks);
      
      // Si estamos actualizando una tarea de hoy, actualizamos ese estado también
      const todayTasks = this._todayTasks.value;
      const taskInToday = todayTasks.findIndex(t => t.id === taskId);
      if (taskInToday >= 0) {
        const updatedTodayTasks = [...todayTasks];
        updatedTodayTasks[taskInToday] = { ...updatedTodayTasks[taskInToday], ...updates };
        this._todayTasks.next(updatedTodayTasks);
      }
      
      return updatedTask;
    } catch (error) {
      const appError = this.errorService.handleError(error, { 
        operation: 'updateTask',
        taskId,
        updates
      });
      await this.errorService.showErrorMessage(appError);
      throw appError;
    } finally {
      this._loading.next(false);
    }
  }

  /**
   * Marca una tarea como completada o pendiente
   */
  async toggleTaskCompletion(taskId: number, completed: boolean): Promise<Task> {
    return this.updateTask(taskId, { completed });
  }

  /**
   * Elimina una tarea
   */
  async deleteTask(taskId: number): Promise<void> {
    this._loading.next(true);
    try {
      await this.supabase.delete('tasks', taskId);
      
      // Actualizamos el estado local
      const currentTasks = this._tasks.value;
      this._tasks.next(currentTasks.filter(task => task.id !== taskId));
      
      // Actualizamos también el estado de tareas de hoy si es necesario
      const todayTasks = this._todayTasks.value;
      this._todayTasks.next(todayTasks.filter(task => task.id !== taskId));
      
    } catch (error) {
      const appError = this.errorService.handleError(error, { 
        operation: 'deleteTask',
        taskId
      });
      await this.errorService.showErrorMessage(appError);
      throw appError;
    } finally {
      this._loading.next(false);
    }
  }

  /**
   * Busca tareas que coincidan con un término de búsqueda
   */
  async searchTasks(searchTerm: string): Promise<Task[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('tasks')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      const appError = this.errorService.handleError(error, { 
        operation: 'searchTasks',
        searchTerm
      });
      await this.errorService.showErrorMessage(appError);
      throw appError;
    }
  }

  /**
   * Obtiene tareas por categoría
   */
  async getTasksByCategory(categoryId: number): Promise<Task[]> {
    try {
      return await this.supabase.query('tasks', query => 
        query.select('*')
          .eq('category_id', categoryId)
          .order('created_at', { ascending: false })
      );
    } catch (error) {
      const appError = this.errorService.handleError(error, { 
        operation: 'getTasksByCategory',
        categoryId
      });
      await this.errorService.showErrorMessage(appError);
      throw appError;
    }
  }

  /**
   * Obtiene tareas por tipo de relación
   */
  async getTasksByRelationCategory(relationCategory: string): Promise<Task[]> {
    try {
      return await this.supabase.query('tasks', query => 
        query.select('*')
          .eq('relation_category', relationCategory)
          .order('created_at', { ascending: false })
      );
    } catch (error) {
      const appError = this.errorService.handleError(error, { 
        operation: 'getTasksByRelationCategory',
        relationCategory
      });
      await this.errorService.showErrorMessage(appError);
      throw appError;
    }
  }

  /**
   * Obtiene tareas por etiqueta
   */
  async getTasksByTag(tag: string): Promise<Task[]> {
    try {
      // Buscar en el array JSONB de etiquetas
      const { data, error } = await this.supabase.client
        .from('tasks')
        .select('*')
        .contains('tags', [tag])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      const appError = this.errorService.handleError(error, { 
        operation: 'getTasksByTag',
        tag
      });
      await this.errorService.showErrorMessage(appError);
      throw appError;
    }
  }

  /**
   * Obtiene tareas atrasadas
   */
  async getOverdueTasks(): Promise<TaskDetailResponse[]> {
    try {
      return await this.supabase.query('overdue_tasks', query => 
        query.select('*').order('due_date', { ascending: true })
      );
    } catch (error) {
      const appError = this.errorService.handleError(error, { 
        operation: 'getOverdueTasks' 
      });
      await this.errorService.showErrorMessage(appError);
      throw appError;
    }
  }

  /**
   * Observables para acceder al estado
   */
  get tasks$(): Observable<Task[]> {
    return this._tasks.asObservable();
  }

  get todayTasks$(): Observable<TaskDetailResponse[]> {
    return this._todayTasks.asObservable();
  }

  get loading$(): Observable<boolean> {
    return this._loading.asObservable();
  }
}