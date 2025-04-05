// src/app/services/focused-task.service.ts
// versión 1.0.0 - 2025-04-04
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaskService } from './task.service';
import { TaskDetailResponse } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class FocusedTaskService {
  private _focusedTask = new BehaviorSubject<TaskDetailResponse | null>(null);
  private _manuallySelected = new BehaviorSubject<boolean>(false);
  private _tasksForPomodoro = new BehaviorSubject<TaskDetailResponse[]>([]);
  
  constructor(private taskService: TaskService) {
    // Inicializar cargando las tareas de hoy
    this.refreshTasks();
  }
  
  // Getters para los Observables
  get focusedTask$(): Observable<TaskDetailResponse | null> {
    return this._focusedTask.asObservable();
  }
  
  get tasksForPomodoro$(): Observable<TaskDetailResponse[]> {
    return this._tasksForPomodoro.asObservable();
  }
  
  // Obtener el valor actual de la tarea enfocada
  get currentFocusedTask(): TaskDetailResponse | null {
    return this._focusedTask.getValue();
  }
  
  // Obtener el valor actual de las tareas para Pomodoro
  get currentTasksForPomodoro(): TaskDetailResponse[] {
    return this._tasksForPomodoro.getValue();
  }
  
  // Determinar si la tarea fue seleccionada manualmente
  get isManuallySelected(): boolean {
    return this._manuallySelected.getValue();
  }
  
  // Refrescar la lista de tareas
  async refreshTasks(): Promise<void> {
    try {
      // Cargar tareas para hoy y pendientes
      await this.taskService.loadOverdueAndTodayTasks();
      
      // Obtener las tareas de hoy y pendientes
      const tasks = await this.taskService.overdueAndTodayTasks$.toPromise();
      
      // Filtrar solo tareas no completadas
      const pendingTasks = tasks?.filter(task => !task.completed) || [];
      
      // Actualizar la lista de tareas para Pomodoro
      this._tasksForPomodoro.next(pendingTasks);
      
      // Si no hay tarea enfocada o si fue elegida automáticamente, determinar la tarea prioritaria
      if (!this._focusedTask.getValue() || !this._manuallySelected.getValue()) {
        this.determineAndSetFocusedTask();
      } else {
        // Asegurarse de que la tarea enfocada sigue en la lista y no ha sido completada
        const focusedTask = this._focusedTask.getValue();
        if (focusedTask) {
          const stillExists = pendingTasks.some(t => t.id === focusedTask.id && !t.completed);
          if (!stillExists) {
            this.determineAndSetFocusedTask();
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing tasks for Pomodoro:', error);
    }
  }
  
  // Determine la tarea más prioritaria
  private determineAndSetFocusedTask(): void {
    const tasks = this._tasksForPomodoro.getValue();
    
    if (!tasks.length) {
      this._focusedTask.next(null);
      this._manuallySelected.next(false);
      return;
    }
    
    // Priorización:
    // 1. Primero tareas marcadas como "frog"
    // 2. Luego tareas con is_important = true
    // 3. Luego por prioridad (alta > media > baja)
    // 4. Finalmente por fecha (más antiguas primero)
    let priorityTask = tasks.find(t => t.is_frog);
    
    if (!priorityTask) {
      priorityTask = tasks.find(t => t.is_important);
    }
    
    if (!priorityTask) {
      // Buscar por prioridad más alta
      const highPriorityTasks = tasks.filter(t => t.priority === 2);
      if (highPriorityTasks.length) {
        // Entre las de alta prioridad, elegir la más antigua
        priorityTask = this.getOldestTask(highPriorityTasks);
      } else {
        // Si no hay de alta prioridad, buscar en las de media
        const mediumPriorityTasks = tasks.filter(t => t.priority === 1);
        if (mediumPriorityTasks.length) {
          priorityTask = this.getOldestTask(mediumPriorityTasks);
        } else {
          // Si no hay de media, elegir entre las de baja
          priorityTask = this.getOldestTask(tasks);
        }
      }
    }
    
    this._focusedTask.next(priorityTask || null);
    this._manuallySelected.next(false);
  }
  
  // Obtener la tarea más antigua de un conjunto
  private getOldestTask(tasks: TaskDetailResponse[]): TaskDetailResponse {
    return tasks.reduce((oldest, current) => {
      if (!oldest.due_date) return current;
      if (!current.due_date) return oldest;
      
      return new Date(current.due_date) < new Date(oldest.due_date) ? current : oldest;
    });
  }
  
  // Establecer manualmente una tarea como enfocada
  setFocusedTask(task: TaskDetailResponse): void {
    this._focusedTask.next(task);
    this._manuallySelected.next(true);
  }
  
  // Marcar la tarea enfocada como completada
  async markFocusedTaskAsCompleted(): Promise<void> {
    const focusedTask = this._focusedTask.getValue();
    
    if (focusedTask?.id) {
      try {
        // Marcar la tarea como completada usando el TaskService
        await this.taskService.toggleTaskCompletion(focusedTask.id, true);
        
        // Refrescar la lista de tareas
        await this.refreshTasks();
      } catch (error) {
        console.error('Error marking focused task as completed:', error);
      }
    }
  }
  
  // Obtener tareas disponibles para Pomodoro (excluyendo la enfocada)
  getAvailableTasks(): Observable<TaskDetailResponse[]> {
    return combineLatest([
      this._tasksForPomodoro,
      this._focusedTask
    ]).pipe(
      map(([tasks, focusedTask]) => {
        if (!focusedTask) return tasks;
        return tasks.filter(task => task.id !== focusedTask.id);
      })
    );
  }
}