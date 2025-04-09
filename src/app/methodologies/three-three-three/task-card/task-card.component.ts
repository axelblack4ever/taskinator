// src/app/methodologies/three-three-three/task-card/task-card.component.ts
// versión 1.0.0 - 2025-04-08
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  IonChip,
  IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  swapHorizontalOutline,
  calendarOutline,
  timeOutline,
  flagOutline,
  alertOutline,
  informationCircleOutline
} from 'ionicons/icons';
import { TaskDetailResponse, TaskType } from '../../../models/task.model';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonIcon,
    IonBadge,
    IonChip,
    IonButton
  ]
})
export class TaskCardComponent {
  @Input() task!: TaskDetailResponse;
  @Input() taskType: TaskType = TaskType.DeepWork;
  @Input() showFullDetails = false;
  
  @Output() openDetails = new EventEmitter<TaskDetailResponse>();
  @Output() swapTask = new EventEmitter<TaskDetailResponse>();
  
  constructor() {
    // Registrar iconos necesarios
    addIcons({
      swapHorizontalOutline,
      calendarOutline,
      timeOutline,
      flagOutline,
      alertOutline,
      informationCircleOutline
    });
  }
  
  /**
   * Obtiene el color de fondo para la tarjeta según el tipo de tarea
   */
  getCardClass(): string {
    switch (this.taskType) {
      case TaskType.DeepWork:
        return 'deep-work-card';
      case TaskType.Impulse:
        return 'impulse-card';
      case TaskType.Maintenance:
        return 'maintenance-card';
      default:
        return '';
    }
  }
  
  /**
   * Obtiene el color correspondiente al tipo de tarea
   */
  getTaskTypeColor(): string {
    switch (this.taskType) {
      case TaskType.DeepWork:
        return 'primary';
      case TaskType.Impulse:
        return 'tertiary';
      case TaskType.Maintenance:
        return 'success';
      default:
        return 'primary';
    }
  }
  
  /**
   * Obtiene el color correspondiente a la prioridad de la tarea
   */
  getPriorityColor(): string {
    switch (this.task.priority) {
      case 2: // Alta
        return 'danger';
      case 1: // Media
        return 'warning';
      default: // Baja
        return 'success';
    }
  }
  
  /**
   * Convierte la prioridad numérica a texto
   */
  getPriorityText(): string {
    switch (this.task.priority) {
      case 2:
        return 'Alta';
      case 1:
        return 'Media';
      default:
        return 'Baja';
    }
  }
  
  /**
   * Formatea una fecha para mostrarla
   */
  formatDate(dateString?: string): string {
    if (!dateString) return 'Sin fecha';
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    
    const diffTime = dateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Mañana';
    } else if (diffDays === -1) {
      return 'Ayer';
    } else if (diffDays < 0) {
      return `Hace ${Math.abs(diffDays)} días`;
    } else {
      return `En ${diffDays} días`;
    }
  }
  
  /**
   * Emite evento para abrir el detalle de la tarea
   */
  onOpenDetails() {
    this.openDetails.emit(this.task);
  }
  
  /**
   * Emite evento para intercambiar la tarea
   */
  onSwapTask() {
    this.swapTask.emit(this.task);
  }
  
  /**
   * Verifica si una tarea está vencida
   */
  isOverdue(): boolean {
    if (!this.task.due_date) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(this.task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  }
}