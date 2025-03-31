// src/app/today/today.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
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
  IonCheckbox,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  ToastController
} from '@ionic/angular/standalone';
import { TaskService } from '../services/task.service';
import { TaskDetailResponse } from '../models/task.model';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';

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
    IonCheckbox,
    IonRefresher,
    IonRefresherContent,
    IonIcon
  ]
})
export class TodayPage implements OnInit, OnDestroy {
  todayTasks: TaskDetailResponse[] = [];
  isLoading = false;
  private subscriptions: Subscription[] = [];
  
  constructor(
    private taskService: TaskService,
    private toastController: ToastController
  ) {
    // Registrar los iconos necesarios
    addIcons({
      add
    });
  }

  ngOnInit() {
    // Suscribirse a los cambios en las tareas de hoy
    this.subscriptions.push(
      this.taskService.todayTasks$.subscribe(tasks => {
        this.todayTasks = tasks;
      })
    );
    
    // Suscribirse al estado de carga
    this.subscriptions.push(
      this.taskService.loading$.subscribe(loading => {
        this.isLoading = loading;
      })
    );
    
    // Cargar las tareas de hoy
    this.loadTodayTasks();
  }
  
  ngOnDestroy() {
    // Limpiar suscripciones al destruir el componente
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  async loadTodayTasks() {
    try {
      await this.taskService.loadTodayTasks();
    } catch (error) {
      console.error('Error cargando tareas de hoy:', error);
      this.showToast('Error al cargar las tareas');
    }
  }
  
  async doRefresh(event: any) {
    try {
      await this.taskService.loadTodayTasks();
    } catch (error) {
      console.error('Error actualizando tareas:', error);
      this.showToast('Error al actualizar las tareas');
    } finally {
      event.target.complete();
    }
  }
  
  async markAsComplete(taskId: number) {
    if (taskId === undefined) return;
    
    const task = this.todayTasks.find(t => t.id === taskId);
    if (task) {
      try {
        // Determinar el nuevo estado - la negación del estado actual
        const newCompletedState = !task.completed;
        
        await this.taskService.toggleTaskCompletion(taskId, newCompletedState);
      } catch (error) {
        console.error('Error actualizando tarea:', error);
        this.showToast('Error al actualizar la tarea');
      }
    }
  }
  
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  }
}