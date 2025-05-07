// src/app/methodologies/eisenhower/components/task-detail/task-detail.component.ts
// versión 1.2.0 - 2025-05-06
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonBadge,
  IonFooter,
  IonChip,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  closeOutline, 
  calendarOutline, 
  flagOutline,
  checkmarkOutline,
  timeOutline,
  bookmarkOutline,
  gridOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-task-detail',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Detalles de Tarea</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h1>{{ task?.title }}</h1>
      
      <ion-list lines="none">
        <!-- Fecha de vencimiento -->
        <ion-item>
          <ion-icon name="calendar-outline" slot="start" [color]="isUrgent ? 'danger' : 'medium'"></ion-icon>
          <ion-label>
            <h2>Fecha de vencimiento</h2>
            <p>{{ formatDate(task?.dueDate) }}</p>
          </ion-label>
          <ion-chip *ngIf="isUrgent" color="danger" slot="end">
            <ion-label>Urgente</ion-label>
          </ion-chip>
        </ion-item>
        
        <!-- Prioridad -->
        <ion-item>
          <ion-icon name="flag-outline" slot="start" [color]="getPriorityColor()"></ion-icon>
          <ion-label>
            <h2>Prioridad</h2>
            <p>{{ getPriorityText() }}</p>
          </ion-label>
        </ion-item>
        
        <!-- Categoría (si existiera) -->
        <ion-item *ngIf="task?.category">
          <ion-icon name="bookmark-outline" slot="start" [color]="task?.categoryColor || 'primary'"></ion-icon>
          <ion-label>
            <h2>Categoría</h2>
            <p>{{ task?.category }}</p>
          </ion-label>
        </ion-item>
        
        <!-- Descripción -->
        <ion-item *ngIf="task?.description" lines="full">
          <ion-label class="ion-text-wrap">
            <h2>Descripción</h2>
            <p>{{ task?.description }}</p>
          </ion-label>
        </ion-item>
        
        <!-- Cuadrante Eisenhower -->
        <ion-item>
          <ion-icon name="grid-outline" slot="start" [color]="getQuadrantColor()"></ion-icon>
          <ion-label>
            <h2>Cuadrante Eisenhower</h2>
            <p>{{ getQuadrantText() }}</p>
          </ion-label>
          <ion-badge slot="end" [color]="getQuadrantColor()">{{ getQuadrantNumber() }}</ion-badge>
        </ion-item>
      </ion-list>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-button expand="block" color="success" (click)="completeTask()">
          <ion-icon name="checkmark-outline" slot="start"></ion-icon>
          MARCAR COMO COMPLETADA
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    h1 {
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--ion-color-dark);
      margin-top: 0;
      margin-bottom: 16px;
    }
    
    ion-list {
      margin-bottom: 16px;
    }
    
    ion-item {
      --padding-start: 0;
      margin-bottom: 8px;
    }
    
    ion-item h2 {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--ion-color-medium);
      margin: 0;
    }
    
    ion-item p {
      font-size: 1rem;
      margin-top: 4px;
      margin-bottom: 0;
      color: var(--ion-color-dark);
    }
    
    ion-icon {
      font-size: 20px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonBadge,
    IonFooter,
    IonChip
  ]
})
export class TaskDetailComponent {
  @Input() task: any = null;
  
  constructor(private modalController: ModalController) {
    addIcons({ 
      closeOutline, 
      calendarOutline, 
      flagOutline,
      checkmarkOutline,
      timeOutline,
      bookmarkOutline,
      gridOutline
    });
  }
  
  get isUrgent(): boolean {
    if (!this.task?.dueDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dueDate = new Date(this.task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate <= tomorrow;
  }
  
  get isImportant(): boolean {
    return this.task?.isImportant || false;
  }
  
  getQuadrantNumber(): number {
    if (this.isImportant && this.isUrgent) return 1;
    if (this.isImportant && !this.isUrgent) return 2;
    if (!this.isImportant && this.isUrgent) return 3;
    return 4;
  }
  
  getQuadrantText(): string {
    switch(this.getQuadrantNumber()) {
      case 1: return 'Urgente e Importante';
      case 2: return 'Importante pero No Urgente';
      case 3: return 'Urgente pero No Importante';
      case 4: return 'Ni Urgente Ni Importante';
      default: return '';
    }
  }
  
  getQuadrantColor(): string {
    switch(this.getQuadrantNumber()) {
      case 1: return 'danger';
      case 2: return 'success';
      case 3: return 'warning';
      case 4: return 'medium';
      default: return 'primary';
    }
  }
  
  getPriorityText(): string {
    switch(this.task?.priority) {
      case 2: return 'Alta';
      case 1: return 'Media';
      case 0: return 'Baja';
      default: return 'No definida';
    }
  }
  
  getPriorityColor(): string {
    switch(this.task?.priority) {
      case 2: return 'danger';
      case 1: return 'warning';
      case 0: return 'success';
      default: return 'medium';
    }
  }
  
  formatDate(dateString?: string): string {
    if (!dateString) return 'Sin fecha';
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    
    if (dateObj.getTime() === today.getTime()) {
      return 'Hoy';
    } else if (dateObj.getTime() === tomorrow.getTime()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString();
    }
  }
  
  dismiss() {
    this.modalController.dismiss();
  }
  
  completeTask() {
    this.modalController.dismiss({
      completed: true,
      task: this.task
    });
  }
}