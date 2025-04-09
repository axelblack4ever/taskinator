// src/app/methodologies/three-three-three/task-swap-modal/task-swap-modal.component.ts
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
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSearchbar,
  IonSpinner,
  IonChip,
  IonListHeader
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  swapHorizontalOutline,
  calendarOutline,
  timeOutline,
  flagOutline,
  alertOutline,
  business,
  rocket,
  construct
} from 'ionicons/icons';
import { TaskDetailResponse, TaskType } from '../../../models/task.model';

@Component({
  selector: 'app-task-swap-modal',
  templateUrl: './task-swap-modal.component.html',
  styleUrls: ['./task-swap-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSearchbar,
    IonSpinner,
    IonChip,
    IonListHeader
  ]
})
export class TaskSwapModalComponent {
  @Input() currentTask!: TaskDetailResponse;
  @Input() taskType: TaskType = TaskType.DeepWork;
  @Input() availableTasks: TaskDetailResponse[] = [];
  @Input() isLoading = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() selectTask = new EventEmitter<TaskDetailResponse>();
  
  searchTerm = '';
  filteredTasks: TaskDetailResponse[] = [];
  
  // Mapa de tipos de tareas para facilitar la visualización
  taskTypesMap: { [key: string]: { name: string; icon: string; color: string } } = {
    deep_work: { name: 'Trabajo Profundo', icon: 'business', color: 'primary' },
    impulse: { name: 'Tarea de Impulso', icon: 'rocket', color: 'tertiary' },
    maintenance: { name: 'Tarea de Mantenimiento', icon: 'construct', color: 'success' }
  };
  
  constructor() {
    // Registrar iconos necesarios
    addIcons({
      closeOutline,
      swapHorizontalOutline,
      calendarOutline,
      timeOutline,
      flagOutline,
      alertOutline,
      business,
      rocket,
      construct
    });
  }
  
  ngOnInit() {
    this.filterTasks();
  }
  
  ngOnChanges() {
    this.filterTasks();
  }
  
  /**
   * Filtra las tareas según el término de búsqueda
   */
  filterTasks() {
    if (!this.availableTasks) {
      this.filteredTasks = [];
      return;
    }
    
    // Si no hay término de búsqueda, mostrar todas las tareas disponibles
    if (!this.searchTerm) {
      this.filteredTasks = [...this.availableTasks];
      return;
    }
    
    // Filtrar por término de búsqueda en título o descripción
    const term = this.searchTerm.toLowerCase();
    this.filteredTasks = this.availableTasks.filter(task => 
      (task.title && task.title.toLowerCase().includes(term)) || 
      (task.description && task.description.toLowerCase().includes(term))
    );
  }
  
  /**
   * Maneja el cambio en el término de búsqueda
   */
  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    this.filterTasks();
  }
  
  /**
   * Emite evento para cerrar el modal
   */
  onClose() {
    this.close.emit();
  }
  
  /**
   * Emite evento al seleccionar una tarea
   */
  onSelectTask(task: TaskDetailResponse) {
    this.selectTask.emit(task);
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
   * Verifica si una tarea está vencida
   */
  isOverdue(task: TaskDetailResponse): boolean {
    if (!task.due_date) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  }
}