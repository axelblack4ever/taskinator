// src/app/methodologies/pomodoro/pomodoro.page.ts
// versión 1.0.0 - 2025-04-04
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons,
  IonMenuButton,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';
import { PomodoroTimerComponent } from './pomodoro-timer/pomodoro-timer.component';
import { PomodoroProgressComponent } from './pomodoro-progress/pomodoro-progress.component';
import { FocusedTaskComponent } from './focused-task/focused-task.component';
import { TaskListComponent } from './task-list/task-list.component';

@Component({
  selector: 'app-pomodoro',
  templateUrl: './pomodoro.page.html',
  styleUrls: ['./pomodoro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonGrid,
    IonRow,
    IonCol,
    PomodoroTimerComponent,
    PomodoroProgressComponent,
    FocusedTaskComponent,
    TaskListComponent
  ]
})
export class PomodoroPage implements OnInit, OnDestroy {

  constructor() { }

  ngOnInit() {
    console.log('PomodoroPage initialized');
  }

  ngOnDestroy() {
    console.log('PomodoroPage destroyed');
  }
}