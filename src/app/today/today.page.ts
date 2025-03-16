// src/app/today/today.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonRouterOutlet } from '@ionic/angular/standalone'; 
// Importa los eventos de ciclo de vida
import { Subscription } from 'rxjs';
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
  IonFab,
  IonFabButton,
  IonIcon
} from '@ionic/angular/standalone';
import { DatabaseService } from '../services/database.service';
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
    IonFab,
    IonFabButton,
    IonIcon
  ]
})
export class TodayPage implements OnInit {
  todayTasks: any[] = [];
  isLoading = true;
  private ionViewWillEnterSubscription: Subscription | undefined;
  
  constructor(private dbService: DatabaseService, private ionRouterOutlet: IonRouterOutlet) {
    // Registrar los iconos que necesitas usar
    addIcons({ add });
  }

  ngOnInit() {
    this.dbService.isDatabaseReady().subscribe(isReady => {
      if (isReady) {
        this.loadTasks();
      }
    });
    // Suscribirse al evento ionViewWillEnter
    this.ionViewWillEnterSubscription = this.ionRouterOutlet.activateEvents.subscribe(() => {
      console.log('Today page activated - reloading tasks');
      this.loadTasks();
    });    
  }

  ngOnDestroy() {
    // Importante: cancela la suscripción para evitar memory leaks
    if (this.ionViewWillEnterSubscription) {
      this.ionViewWillEnterSubscription.unsubscribe();
    }
  }  
  
  async loadTasks() {
    this.isLoading = true;
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching tasks for date:', today);
      this.todayTasks = await this.dbService.getTasksByDate(today) || [];
      console.log('Tasks loaded:', this.todayTasks);
    } catch (error) {
      console.error('Error al cargar tareas', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  async markAsComplete(taskId: number) {
    await this.dbService.updateTask(taskId, { completed: 1 });
    await this.loadTasks();
  }
}