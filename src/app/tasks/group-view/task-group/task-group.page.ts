import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { TaskService } from '../../../services/task.service';
import { TaskDetailResponse } from '../../../models/task.model';
import { TaskSectionComponent } from '../task-section/task-section.component';

@Component({
  selector: 'app-task-group',
  templateUrl: './task-group.page.html',
  styleUrls: ['./task-group.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, TaskSectionComponent]
})
export class TaskGroupPage implements OnInit {
  type: string | null = null;
  value: string | null = null;

  overdue: TaskDetailResponse[] = [];
  pending: TaskDetailResponse[] = [];
  completed: TaskDetailResponse[] = [];

  constructor(private route: ActivatedRoute, private taskService: TaskService) {}

  ngOnInit() {
    this.type = this.route.snapshot.paramMap.get('type');
    this.value = this.route.snapshot.paramMap.get('value');
    this.loadTasks();
  }

  async loadTasks() {
    if (!this.type || !this.value) {
      return;
    }
    if (this.type === 'category') {
      const result = await this.taskService.getTasksByCategoryGrouped(+this.value);
      this.overdue = result.overdue;
      this.pending = result.pending;
      this.completed = result.completed;
    } else if (this.type === 'tag') {
      const result = await this.taskService.getTasksByTagGrouped(this.value);
      this.overdue = result.overdue;
      this.pending = result.pending;
      this.completed = result.completed;
    }
  }

  get totalTasks(): number {
    return this.overdue.length + this.pending.length + this.completed.length;
  }
}