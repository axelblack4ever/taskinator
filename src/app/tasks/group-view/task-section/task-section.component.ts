import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonList, IonItem, IonLabel, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { TaskDetailResponse } from '../../../models/task.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-section',
  templateUrl: './task-section.component.html',
  styleUrls: ['./task-section.component.scss'],
  standalone: true,
  imports: [CommonModule, IonList, IonItem, IonLabel, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonSelect, IonSelectOption, FormsModule]
})
export class TaskSectionComponent {
  @Input() title = '';
  @Input() tasks: TaskDetailResponse[] = [];
  @Input() color = 'black';

  collapsed = false;
  sort = 'date';

  toggle() {
    this.collapsed = !this.collapsed;
  }

  sortTasks() {
    const tasks = [...this.tasks];
    if (this.sort === 'priority') {
      tasks.sort((a, b) => b.priority - a.priority || this.compareDates(a, b));
    } else if (this.sort === 'frog') {
      tasks.sort((a, b) => {
        if (a.is_frog !== b.is_frog) {
          return a.is_frog ? -1 : 1;
        }
        return this.compareDates(a, b);
      });
    } else {
      tasks.sort((a, b) => this.compareDates(a, b));
    }
    this.tasks = tasks;
  }

  private compareDates(a: TaskDetailResponse, b: TaskDetailResponse): number {
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    return 0;
  }
}