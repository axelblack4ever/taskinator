import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonButton,
  IonCheckbox
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-today',
  templateUrl: './today.page.html',
  styleUrls: ['./today.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterLink,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSpinner,
    IonButton,
    IonCheckbox
  ]
})
export class TodayPage implements OnInit {
  // Datos de ejemplo para mostrar
  todayTasks: any[] = [
    {
      id: 1,
      title: 'Completar la aplicación Taskinator',
      description: 'Terminar la implementación de las funcionalidades básicas',
      category_name: 'Trabajo',
      category_color: '#33A1FF',
      completed: 0
    },
    {
      id: 2,
      title: 'Repasar conceptos de Ionic',
      description: 'Revisar documentación sobre componentes standalone y routing',
      category_name: 'Estudios',
      category_color: '#33FF57',
      completed: 0
    }
  ];
  
  isLoading = false;
  
  constructor() { }

  ngOnInit() {
    console.log('TodayPage initialized');
  }
  
  markAsComplete(taskId: number) {
    const task = this.todayTasks.find(t => t.id === taskId);
    if (task) {
      task.completed = task.completed === 0 ? 1 : 0;
    }
  }
}