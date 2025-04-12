// src/app/methodologies/three-three-three/section-content/section-content.component.ts
// versión 1.1.0 - 2025-04-12
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskDetailResponse, TaskType } from '../../../models/task.model';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-section-content',
  templateUrl: './section-content.component.html',
  styleUrls: ['./section-content.component.scss'],
  standalone: true,
  imports: [CommonModule, TaskCardComponent]
})
export class SectionContentComponent {
  @Input() tasks: TaskDetailResponse[] = [];
  @Input() type: TaskType = TaskType.DeepWork;
  @Input() loading = false;
  
  @Output() openDetails = new EventEmitter<TaskDetailResponse>();
  @Output() swapTask = new EventEmitter<TaskDetailResponse>();
  
  // Constante para acceso al tipo de tarea en el template
  readonly TASK_TYPE = TaskType;
  
  constructor() { }
  
  onOpenDetails(task: TaskDetailResponse) {
    this.openDetails.emit(task);
  }
  
  onSwapTask(task: TaskDetailResponse) {
    this.swapTask.emit(task);
  }
  
  shouldShowFullDetails(): boolean {
    return this.type === TaskType.DeepWork;
  }
  
  getSectionClass(): string {
    switch (this.type) {
      case TaskType.DeepWork:
        return 'deep-work-content';
      case TaskType.Impulse:
        return 'impulse-content';
      case TaskType.Maintenance:
        return 'maintenance-content';
      default:
        return '';
    }
  }
  
  getTasksToDisplay(): TaskDetailResponse[] {
    // Para trabajo profundo, solo mostrar la primera tarea
    if (this.type === TaskType.DeepWork) {
      return this.tasks.slice(0, 1);
    }
    // Para otros tipos, mostrar hasta 3 tareas
    return this.tasks.slice(0, 3);
  }
}