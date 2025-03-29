// src/app/pipes/filter-tasks.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { TaskDetailResponse } from '../models/task.model';

@Pipe({
  name: 'filterTasks',
  standalone: true
})
export class FilterTasksPipe implements PipeTransform {
  transform(tasks: TaskDetailResponse[], filter: 'overdue' | 'today' | 'completed'): TaskDetailResponse[] {
    if (!tasks || !tasks.length) {
      return [];
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    switch (filter) {
      case 'overdue':
        // Tareas vencidas y no completadas
        return tasks.filter(task => task.is_overdue && !task.completed);
        
      case 'today':
        // Tareas de hoy no completadas
        return tasks.filter(task => {
          const taskDate = task.due_date ? task.due_date.split('T')[0] : null;
          return !task.is_overdue && taskDate === today && !task.completed;
        });
        
      case 'completed':
        // Tareas completadas (solo de hoy o anteriores que se completaron hoy)
        return tasks.filter(task => task.completed);
        
      default:
        return tasks;
    }
  }
}