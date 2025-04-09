// src/app/methodologies/three-three-three/section-header/section-header.component.ts
// versión 1.0.0 - 2025-04-08
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { TaskType } from '../../../models/task.model';

@Component({
  selector: 'app-section-header',
  template: `
    <div class="section-header" [ngClass]="getSectionClass()">
      <ion-icon [name]="getIcon()" [color]="getColor()"></ion-icon>
      <h2>{{ getTitle() }}</h2>
    </div>
  `,
  styles: [`
    .section-header {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 8px;
      border-radius: 8px 8px 0 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 10;
      
      ion-icon {
        font-size: 24px;
        margin-right: 8px;
      }
      
      h2 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 500;
      }
    }
    
    .deep-work-header {
      background-color: rgba(var(--ion-color-primary-rgb), 0.1);
    }
    
    .impulse-header {
      background-color: rgba(var(--ion-color-tertiary-rgb), 0.1);
    }
    
    .maintenance-header {
      background-color: rgba(var(--ion-color-success-rgb), 0.1);
    }
  `],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class SectionHeaderComponent {
  @Input() type: TaskType = TaskType.DeepWork;
  
  getIcon(): string {
    switch (this.type) {
      case TaskType.DeepWork:
        return 'business';
      case TaskType.Impulse:
        return 'rocket';
      case TaskType.Maintenance:
        return 'construct';
      default:
        return 'business';
    }
  }
  
  getColor(): string {
    switch (this.type) {
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
  
  getTitle(): string {
    switch (this.type) {
      case TaskType.DeepWork:
        return 'Trabajo Profundo';
      case TaskType.Impulse:
        return 'Tareas de Impulso';
      case TaskType.Maintenance:
        return 'Tareas de Mantenimiento';
      default:
        return 'Tareas';
    }
  }
  
  getSectionClass(): string {
    switch (this.type) {
      case TaskType.DeepWork:
        return 'deep-work-header';
      case TaskType.Impulse:
        return 'impulse-header';
      case TaskType.Maintenance:
        return 'maintenance-header';
      default:
        return '';
    }
  }
}