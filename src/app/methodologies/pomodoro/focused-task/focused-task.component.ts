// src/app/methodologies/pomodoro/components/focused-task/focused-task.component.ts
// versión 1.0.0 - 2025-04-04
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
  IonBadge,
  IonChip,
  IonLabel,
  IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  checkmark, 
  time, 
  warning, 
  alert,
  refresh,
  flag
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { FocusedTaskService } from 'src/app/services/focused-task.service';
import { TaskDetailResponse } from 'src/app/models/task.model';

@Component({
  selector: 'app-focused-task',
  templateUrl: './focused-task.component.html',
  styleUrls: ['./focused-task.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonText,
    IonBadge,
    IonChip,
    IonLabel,
    IonSkeletonText
  ]
})
export class FocusedTaskComponent implements OnInit, OnDestroy {
  focusedTask: TaskDetailResponse | null = null;
  isLoading = true;
  
  private focusedTaskSubscription?: Subscription;
  
  constructor(private focusedTaskService: FocusedTaskService) {
    // Registrar iconos
    addIcons({
      checkmark,
      time,
      warning,
      alert,
      refresh,
      flag
    });
  }

  ngOnInit() {
    // Cargar tareas iniciales
    this.refreshTasks();
    
    // Suscribirse a cambios en la tarea enfocada
    this.focusedTaskSubscription = this.focusedTaskService.focusedTask$.subscribe((task: TaskDetailResponse | null) => {
      this.focusedTask = task;
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    // Limpieza de suscripciones
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
  
  // Marcar tarea como completada
  async markAsCompleted() {
    if (!this.focusedTask) return;
    
    try {
      await this.focusedTaskService.markFocusedTaskAsCompleted();
    } catch (error) {
      console.error('Error marking task as completed:', error);
    }
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
  
  // Obtener texto de prioridad
  getPriorityText(priority: number): string {
    switch (priority) {
      case 2: return 'Alta';
      case 1: return 'Media';
      default: return 'Baja';
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