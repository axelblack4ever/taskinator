// src/app/methodologies/three-three-three/task-modal/task-modal.component.ts
// versión 1.0.0 - 2025-04-08
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonChip,
  IonLabel,
  IonItem,
  IonList,
  IonFooter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  calendarOutline,
  timeOutline,
  flagOutline,
  alertOutline,
  checkmarkOutline
} from 'ionicons/icons';
import { TaskDetailResponse, TaskType } from '../../../models/task.model';

@Component({
  selector: 'app-task-modal',
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonChip,
    IonLabel,
    IonItem,
    IonList,
    IonFooter
  ]
})
export class TaskModalComponent {
  @Input() task!: TaskDetailResponse;
  @Output() close = new EventEmitter<void>();
  @Output() markComplete = new EventEmitter<TaskDetailResponse>();
  
  constructor() {
    // Registrar iconos necesarios
    addIcons({
      closeOutline,
      calendarOutline,
      timeOutline,
      flagOutline,
      alertOutline,
      checkmarkOutline
    });
  }
  
  /**
   * Obtiene el color correspondiente al tipo de tarea
   */
  getTaskTypeColor(): string {
    if (!this.task?.task_type) return 'primary';
    
    switch (this.task.task_type) {
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
   * Obtiene el texto correspondiente al tipo de tarea
   */
  getTaskTypeText(): string {
    if (!this.task?.task_type) return 'Trabajo Profundo';
    
    switch (this.task.task_type) {
      case TaskType.DeepWork:
        return 'Trabajo Profundo';
      case TaskType.Impulse:
        return 'Tarea de Impulso';
      case TaskType.Maintenance:
        return 'Tarea de Mantenimiento';
      default:
        return 'Tarea';
    }
  }
  
  /**
   * Obtiene el color correspondiente a la prioridad de la tarea
   */
  getPriorityColor(): string {
    switch (this.task?.priority) {
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
    switch (this.task?.priority) {
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
    return date.toLocaleDateString();
  }
  
  /**
   * Cierra el modal
   */
  onClose() {
    this.close.emit();
  }
  
  /**
   * Emite evento para marcar tarea como completada
   */
  onMarkComplete() {
    this.markComplete.emit(this.task);
  }
  
  /**
   * Verifica si una tarea está vencida
   */
  isOverdue(): boolean {
    if (!this.task?.due_date) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(this.task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  }
}