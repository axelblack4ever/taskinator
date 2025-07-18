import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCol, IonRow, IonGrid, IonButton } from '@ionic/angular/standalone';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel,
  IonBadge
} from '@ionic/angular/standalone';
import { StatisticsService, WeeklyStats, CategoryStats } from '../services/statistics.service';
import { TaskService } from '../services/task.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    CommonModule,
    FormsModule
  ]
})

export class StatisticsPage implements OnInit, OnDestroy {

  totalTasks = 0;
  totalPending = 0;
  totalCompleted = 0;
  weeksToDisplay = 5;

  weeklyStats: WeeklyStats[] = [];
  categoryStats: CategoryStats[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private statisticsService: StatisticsService,
    private taskService: TaskService
  ) { }

  async ngOnInit() {
    // Load initial statistics data
    await this.statisticsService.loadData();
    this.refreshStats(); // primera carga

    // React to any change in the tasks list
    this.subscriptions.push(
      this.taskService.tasks$.subscribe(() => this.refreshStats())
    );

    // Initial load
    await this.taskService.loadTasks();
  }

  ionViewWillEnter() {
    // Reload tasks whenever the page becomes active
    this.taskService.loadTasks().catch(() => {});
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  showMoreWeeks() {
    this.weeksToDisplay += 5;
  }

  refreshStats() {
    this.totalTasks = this.statisticsService.getTotalTasks();
    this.totalPending = this.statisticsService.getPendingTotal();
    this.totalCompleted = this.statisticsService.getCompletedTotal();

    this.weeklyStats = this.statisticsService.getCompletedTasksPerWeek();
    this.categoryStats = this.statisticsService.getCountsPerCategory();
  }
}