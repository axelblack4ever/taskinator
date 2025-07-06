// src/app/methodologies/pomodoro/components/task-list/task-list.component.ts
// versión 1.0.0 - 2025-04-04
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonSkeletonText,
  IonText,
  IonChip
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  warning, 
  alert,
  refresh,
  flag,
  time,
  arrowUp
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { FocusedTaskService } from 'src/app/services/focused-task.service';
import { TaskDetailResponse } from 'src/app/models/task.model';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonSkeletonText,
    IonText,
    IonChip
  ]
})
export class TaskListComponent implements OnInit, OnDestroy {
  availableTasks: TaskDetailResponse[] = [];
  focusedTask: TaskDetailResponse | null = null;
  isLoading = true;
  
  private availableTasksSubscription?: Subscription;
  private focusedTaskSubscription?: Subscription;
  
  constructor(private focusedTaskService: FocusedTaskService) {
    // Registrar iconos
    addIcons({
      warning,
      alert,
      refresh,
      flag,
      time,
      arrowUp
    });
  }

  ngOnInit() {
    // Cargar tareas iniciales
    this.refreshTasks();
    
    // Suscribirse a las tareas disponibles
    this.availableTasksSubscription = this.focusedTaskService.getAvailableTasks().subscribe(tasks => {
      console.log('Tareas disponibles recibidas:', tasks);
      this.availableTasks = tasks;
      this.isLoading = false;
    });
    
    // Suscribirse a la tarea enfocada
    this.focusedTaskSubscription = this.focusedTaskService.focusedTask$.subscribe(task => {
      console.log('Tarea enfocada en component de lista:', task);
      this.focusedTask = task;
    });
  }

  ngOnDestroy() {
    // Limpieza de suscripciones
    this.availableTasksSubscription?.unsubscribe();
    this.focusedTaskSubscription?.unsubscribe();
  }
  
  // Refrescar tareas
  async refreshTasks() {
    this.isLoading = true;
    try {
      await this.focusedTaskService.refreshTasks();
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  // Cuando se arrastra una tarea
  onTaskDrop(event: CdkDragDrop<TaskDetailResponse[]>) {
    if (event.previousIndex !== event.currentIndex) {
      const task = this.availableTasks[event.previousIndex];
      this.setFocusedTask(task);
    }
  }
  
  // Establecer una tarea como enfocada
  setFocusedTask(task: TaskDetailResponse) {
    this.focusedTaskService.setFocusedTask(task);
  }
  
  // Formatear fecha para mostrar
  formatDate(dateString?: string): string {
    if (!dateString) return 'Sin fecha';
    
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  // Obtener color de prioridad
  getPriorityColor(priority: number): string {
    switch (priority) {
      case 2: return 'danger';
      case 1: return 'warning';
      default: return 'success';
    }
  }
  
  // Verificar si una tarea está vencida
  isOverdue(task: TaskDetailResponse): boolean {
    if (!task.due_date) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today && !task.completed;
  }
}