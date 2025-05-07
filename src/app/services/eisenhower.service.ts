// src/app/services/eisenhower.service.ts
// versión 1.0.0 - 2025-05-06
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaskService } from './task.service';
import { TaskDetailResponse } from '../models/task.model';

export interface EisenhowerMatrix {
  quadrant1: TaskDetailResponse[]; // Urgente e Importante
  quadrant2: TaskDetailResponse[]; // Importante pero No Urgente
  quadrant3: TaskDetailResponse[]; // Urgente pero No Importante
  quadrant4: TaskDetailResponse[]; // Ni Urgente Ni Importante
}

@Injectable({
  providedIn: 'root'
})
export class EisenhowerService {
  private _matrixTasks = new BehaviorSubject<EisenhowerMatrix>({
    quadrant1: [],
    quadrant2: [],
    quadrant3: [],
    quadrant4: []
  });
  
  private _overdueTasks = new BehaviorSubject<TaskDetailResponse[]>([]);
  private _isLoading = new BehaviorSubject<boolean>(false);

  constructor(private taskService: TaskService) {
    // Iniciar la sincronización con TaskService
    this.initTaskSync();
  }

  /**
   * Inicializa la sincronización con el servicio de tareas
   * para mantener actualizada la matriz
   */
  private initTaskSync() {
    // Suscribirse a cambios en las tareas del TaskService
    this.taskService.tasks$.subscribe(() => {
      this.refreshMatrix();
    });
  }

  /**
   * Actualiza la matriz con las tareas del TaskService
   */
  async refreshMatrix() {
    this._isLoading.next(true);
    
    try {
      // Cargar todas las tareas del usuario
      await this.taskService.loadTasks();
      
      // Obtener todas las tareas (completadas y no completadas)
      const allTasks = this.taskService.currentTasks;
      
      // Filtrar tareas completadas
      const pendingTasks = allTasks.filter(task => !task.completed);
      
      // Filtrar tareas vencidas
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const overdueTasks = pendingTasks.filter(task => {
        if (!task.due_date) return false;
        
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);
        
        return dueDate < today;
      });
      
      this._overdueTasks.next(overdueTasks);
      
      // Clasificar tareas en los cuadrantes (excluyendo las vencidas)
      const nonOverdueTasks = pendingTasks.filter(task => {
        if (!task.due_date) return true; // Sin fecha se considera no vencida
        
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);
        
        return dueDate >= today;
      });
      
      // Clasificar según urgencia e importancia
      const matrixTasks: EisenhowerMatrix = {
        quadrant1: [], // Urgente e Importante
        quadrant2: [], // Importante pero No Urgente
        quadrant3: [], // Urgente pero No Importante
        quadrant4: []  // Ni Urgente Ni Importante
      };
      
      nonOverdueTasks.forEach(task => {
        const isImportant = task.is_important;
        const isUrgent = this.isTaskUrgent(task);
        
        // Distribuir en el cuadrante correspondiente
        if (isImportant && isUrgent) {
          matrixTasks.quadrant1.push(task);
        } else if (isImportant && !isUrgent) {
          matrixTasks.quadrant2.push(task);
        } else if (!isImportant && isUrgent) {
          matrixTasks.quadrant3.push(task);
        } else {
          matrixTasks.quadrant4.push(task);
        }
      });
      
      // Ordenar tareas en cada cuadrante por fecha de vencimiento (más cercana primero)
      this.sortTasksByDueDate(matrixTasks.quadrant1);
      this.sortTasksByDueDate(matrixTasks.quadrant2);
      this.sortTasksByDueDate(matrixTasks.quadrant3);
      this.sortTasksByDueDate(matrixTasks.quadrant4);
      
      // Actualizar el BehaviorSubject con las tareas clasificadas
      this._matrixTasks.next(matrixTasks);
      
    } catch (error) {
      console.error('Error al refrescar la matriz de Eisenhower:', error);
    } finally {
      this._isLoading.next(false);
    }
  }

  /**
   * Ordena una lista de tareas por fecha de vencimiento (más cercana primero)
   */
  private sortTasksByDueDate(tasks: TaskDetailResponse[]) {
    tasks.sort((a, b) => {
      // Si alguna tarea no tiene fecha, se considera con fecha lejana
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      
      // Comparar fechas (más cercana primero)
      const dateA = new Date(a.due_date);
      const dateB = new Date(b.due_date);
      
      return dateA.getTime() - dateB.getTime();
    });
  }

  /**
   * Determina si una tarea es urgente (con vencimiento hoy o mañana)
   */
  isTaskUrgent(task: TaskDetailResponse): boolean {
    if (!task.due_date) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999); // Final del día de mañana
    
    const dueDate = new Date(task.due_date);
    
    return dueDate <= tomorrow;
  }

  /**
   * Marca una tarea como completada
   */
  async completeTask(taskId: number): Promise<void> {
    if (!taskId) return;
    
    try {
      await this.taskService.toggleTaskCompletion(taskId, true);
      // La matriz se actualizará automáticamente a través de la suscripción
    } catch (error) {
      console.error('Error al completar la tarea:', error);
      throw error;
    }
  }

  /**
   * Observable para las tareas de la matriz
   */
  get matrixTasks$(): Observable<EisenhowerMatrix> {
    return this._matrixTasks.asObservable();
  }

  /**
   * Observable para las tareas vencidas
   */
  get overdueTasks$(): Observable<TaskDetailResponse[]> {
    return this._overdueTasks.asObservable();
  }

  /**
   * Observable para el estado de carga
   */
  get loading$(): Observable<boolean> {
    return this._isLoading.asObservable();
  }

  /**
   * Obtiene el valor actual de las tareas de la matriz
   */
  get currentMatrixTasks(): EisenhowerMatrix {
    return this._matrixTasks.getValue();
  }

  /**
   * Obtiene el valor actual de las tareas vencidas
   */
  get currentOverdueTasks(): TaskDetailResponse[] {
    return this._overdueTasks.getValue();
  }

  /**
   * Indica si hay tareas vencidas
   */
  get hasOverdueTasks(): boolean {
    return this._overdueTasks.getValue().length > 0;
  }

  /**
   * Observable que indica si hay tareas vencidas
   */
  get hasOverdueTasks$(): Observable<boolean> {
    return this._overdueTasks.pipe(
      map(tasks => tasks.length > 0)
    );
  }
}