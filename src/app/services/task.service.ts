// src/app/services/task.service.ts
// versión 1.1.0 - 2025-04-04
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

export interface GroupedTasks {
  overdue: TaskDetailResponse[];
  pending: TaskDetailResponse[];
  completed: TaskDetailResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private _tasks = new BehaviorSubject<Task[]>([]);
  private _todayTasks = new BehaviorSubject<TaskDetailResponse[]>([]);
  private _overdueAndTodayTasks = new BehaviorSubject<TaskDetailResponse[]>([]);
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
   * Carga las tareas para hoy y vencidas (no completadas)
   * Las ordena con las vencidas primero y luego las del día actual
   */
  async loadOverdueAndTodayTasks(): Promise<void> {
    this._loading.next(true);
    try {
      // Obtener la fecha actual en formato ISO (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      
      // Consulta personalizada para obtener:
      // 1. Tareas vencidas (anterior a hoy) NO completadas
      // 2. Todas las tareas de hoy
      const { data, error } = await this.supabase.client
        .from('tasks')
        .select(`
          *,
          category:category_id (
            id,
            name,
            color
          )
        `)
        .or(`and(due_date.lt.${today},completed.eq.false),due_date.eq.${today}`)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      // Procesar los datos para marcar tareas vencidas y formatearlas correctamente
      const processedData: TaskDetailResponse[] = (data as any[]).map((task: any) => {
        const taskDueDate = task.due_date ? new Date(task.due_date) : null;
        // Una tarea está vencida si su fecha es anterior a hoy y no está completada
        const isOverdue = taskDueDate ? 
          (taskDueDate < new Date(today) && !task.completed) : false;
        
        return {
          ...task,
          is_overdue: isOverdue,
          category_name: task.category?.name,
          category_color: task.category?.color
        } as TaskDetailResponse;
      });
      
      // Ordenar: primero tareas vencidas no completadas, luego tareas de hoy no completadas, finalmente tareas de hoy completadas
      const sortedTasks = processedData.sort((a, b) => {
        // Si una tarea está vencida y la otra no (y ambas no completadas)
        if (!a.completed && !b.completed && a.is_overdue !== b.is_overdue) {
          return a.is_overdue ? -1 : 1; // Las vencidas primero
        }
        
        // Si una está completada y la otra no
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1; // Las no completadas primero
        }
        
        // Dentro del mismo grupo (vencidas no completadas, de hoy no completadas, o completadas)
        // ordenar por prioridad (más alta primero)
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        
        // Si tienen la misma prioridad, ordenar por fecha de vencimiento (más antigua primero)
        if (a.due_date && b.due_date) {
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        
        return 0;
      });
      
      this._overdueAndTodayTasks.next(sortedTasks);
    } catch (error) {
      const appError = this.errorService.handleError(error, { operation: 'loadOverdueAndTodayTasks' });
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
      // Si se está actualizando el estado completado, añadir la fecha de completado
      if (updates.completed !== undefined) {
        updates.completed_at = updates.completed ? new Date().toISOString() : undefined;
      }
      
      const updatedTask = await this.supabase.update('tasks', taskId, updates);
      
      // Actualizamos el estado local
      const currentTasks = this._tasks.value;
      const updatedTasks = currentTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      );
      this._tasks.next(updatedTasks);
      
      // Actualizar también todayTasks si es necesario
      const todayTasks = this._todayTasks.value;
      const taskInToday = todayTasks.findIndex(t => t.id === taskId);
      if (taskInToday >= 0) {
        const updatedTodayTasks = [...todayTasks];
        updatedTodayTasks[taskInToday] = { ...updatedTodayTasks[taskInToday], ...updates };
        this._todayTasks.next(updatedTodayTasks);
      }
      
      // Actualizar overdueAndTodayTasks
      const overdueAndTodayTasks = this._overdueAndTodayTasks.value;
      const taskInOverdueAndToday = overdueAndTodayTasks.findIndex(t => t.id === taskId);
      if (taskInOverdueAndToday >= 0) {
        const updatedOverdueAndTodayTasks = [...overdueAndTodayTasks];
        updatedOverdueAndTodayTasks[taskInOverdueAndToday] = { 
          ...updatedOverdueAndTodayTasks[taskInOverdueAndToday], 
          ...updates 
        };
        
        // Re-ordenar las tareas según nuestros criterios
        const reorderedTasks = this.sortOverdueAndTodayTasks(updatedOverdueAndTodayTasks);
        this._overdueAndTodayTasks.next(reorderedTasks);
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
   * Ordena las tareas: primero vencidas no completadas, luego pendientes del día, finalmente completadas
   */
  private sortOverdueAndTodayTasks(tasks: TaskDetailResponse[]): TaskDetailResponse[] {
    return tasks.sort((a, b) => {
      // Si una tarea está vencida y la otra no (y ambas no completadas)
      if (!a.completed && !b.completed && a.is_overdue !== b.is_overdue) {
        return a.is_overdue ? -1 : 1; // Las vencidas primero
      }
      
      // Si una está completada y la otra no
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1; // Las no completadas primero
      }
      
      // Dentro del mismo grupo (vencidas no completadas, de hoy no completadas, o completadas)
      // ordenar por prioridad (más alta primero)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      // Si tienen la misma prioridad, ordenar por fecha de vencimiento (más antigua primero)
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      
      return 0;
    });
  }

  /**
   * Marca una tarea como completada o pendiente
   */
  async toggleTaskCompletion(taskId: number, completed: boolean): Promise<Task> {
    const updates: UpdateTaskRequest = { 
      completed,
      completed_at: completed ? new Date().toISOString() : undefined
    };
    return this.updateTask(taskId, updates);
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
      
      // Actualizamos también el estado de tareas vencidas y de hoy
      const overdueAndTodayTasks = this._overdueAndTodayTasks.value;
      this._overdueAndTodayTasks.next(overdueAndTodayTasks.filter(task => task.id !== taskId));
      
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
   * Obtiene tareas por categoría y las agrupa en vencidas, pendientes y completadas
   */
  async getTasksByCategoryGrouped(categoryId: number): Promise<GroupedTasks> {
    const tasks = await this.getTasksByCategory(categoryId);
    return this.groupTasks(tasks);
  }

  /**
   * Obtiene tareas por etiqueta y las agrupa en vencidas, pendientes y completadas
   */
  async getTasksByTagGrouped(tag: string): Promise<GroupedTasks> {
    const tasks = await this.getTasksByTag(tag);
    return this.groupTasks(tasks);
  }

  /**
   * Agrupa las tareas en vencidas, pendientes y completadas
   * @param tasks Lista de tareas a agrupar
   * @returns Objeto con las tareas agrupadas
   */
  private groupTasks(tasks: TaskDetailResponse[]): GroupedTasks {
    const today = new Date().toISOString().split('T')[0];
    const overdue = tasks.filter(t => !t.completed && t.due_date && t.due_date < today)
      .sort((a,b)=>new Date(a.due_date!).getTime()-new Date(b.due_date!).getTime());
    const pending = tasks.filter(t => !t.completed && (!t.due_date || t.due_date >= today))
      .sort((a,b)=>new Date(a.due_date || '') .getTime()-new Date(b.due_date || '') .getTime());
    const completed = tasks.filter(t => t.completed)
      .sort((a,b)=>{
        const ad = a.completed_at || a.updated_at || a.due_date || '';
        const bd = b.completed_at || b.updated_at || b.due_date || '';
        return new Date(bd).getTime()-new Date(ad).getTime();
      });
    return { overdue, pending, completed };
  }


  /**
   * Obtiene tareas atrasadas
   */
  async getOverdueTasks(): Promise<TaskDetailResponse[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await this.supabase.client
        .from('tasks')
        .select(`
          *,
          category:category_id (
            id,
            name,
            color
          )
        `)
        .lt('due_date', today)
        .eq('completed', false)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      // Procesar los datos para asegurar compatibilidad con la interfaz
      const processedData: TaskDetailResponse[] = (data as any[]).map((task: any) => {
        return {
          ...task,
          is_overdue: true,
          category_name: task.category?.name,
          category_color: task.category?.color
        } as TaskDetailResponse;
      });
      
      return processedData;
    } catch (error) {
      const appError = this.errorService.handleError(error, { 
        operation: 'getOverdueTasks' 
      });
      await this.errorService.showErrorMessage(appError);
      throw appError;
    }
  }
  /**
   * Obtiene las tareas marcadas como frog y no completadas
   */
  async getFrogTasks(): Promise<TaskDetailResponse[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('tasks')
        .select(`
          *,
          category:category_id (
            id,
            name,
            color
          )
        `)
        .eq('is_frog', true)
        .eq('completed', false)
        .order('due_date', { ascending: true })
        .order('is_important', { ascending: false });

      if (error) throw error;

      return (data as any[]).map((task: any) => ({
        ...task,
        category_name: task.category?.name,
        category_color: task.category?.color
      })) as TaskDetailResponse[];
    } catch (error) {
      const appError = this.errorService.handleError(error, {
        operation: 'getFrogTasks'
      });
      await this.errorService.showErrorMessage(appError);
      throw appError;
    }
  }
  // MODIFICACION DE CODIGO
  /**
   * Getters para acceder a los valores actuales
   */
  get currentTasks(): Task[] {
    return this._tasks.getValue();
  }

  get currentTodayTasks(): TaskDetailResponse[] {
    return this._todayTasks.getValue();
  }

  get currentOverdueAndTodayTasks(): TaskDetailResponse[] {
    return this._overdueAndTodayTasks.getValue();
  }

  get isLoading(): boolean {
    return this._loading.getValue();
  }
  // MODIFICACION DE CODIGO

  /**
   * Observables para acceder al estado
   */
  get tasks$(): Observable<Task[]> {
    return this._tasks.asObservable();
  }

  get todayTasks$(): Observable<TaskDetailResponse[]> {
    return this._todayTasks.asObservable();
  }
  
  get overdueAndTodayTasks$(): Observable<TaskDetailResponse[]> {
    return this._overdueAndTodayTasks.asObservable();
  }

  get loading$(): Observable<boolean> {
    return this._loading.asObservable();
  }
}