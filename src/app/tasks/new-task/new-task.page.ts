// src/app/tasks/new-task/new-task.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonButton,
  IonSpinner,
  IonToast,
  IonIcon
} from '@ionic/angular/standalone';
import { DatabaseService } from '../../services/database.service';
import { addIcons } from 'ionicons';
import { calendarOutline, flagOutline, saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.page.html',
  styleUrls: ['./new-task.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    IonButton,
    IonSpinner,
    IonToast,
    IonIcon
  ]
})
export class NewTaskPage implements OnInit {
  
  newTask = {
    title: '',
    description: '',
    category_id: null as number | null,
    due_date: new Date().toISOString().split('T')[0],
    priority: 0,
    methodology: null as string | null
  };
  
  categories: any[] = [];
  isLoading = false;
  showToast = false;
  toastMessage = '';
  
  constructor(
    private dbService: DatabaseService,
    private router: Router
  ) {
    addIcons({
      calendarOutline,
      flagOutline,
      saveOutline
    });
  }

  ngOnInit() {
    this.loadCategories();
  }
  
  async loadCategories() {
    this.categories = await this.dbService.getAllCategories();
  }
  
  async saveTask() {
    if (!this.newTask.title.trim()) {
      this.toastMessage = 'El título es obligatorio';
      this.showToast = true;
      return;
    }
    
    this.isLoading = true;
    
    try {
      await this.dbService.addTask(this.newTask);
      this.toastMessage = 'Tarea creada correctamente';
      this.showToast = true;
      
      // Navegar a la página anterior y forzar recarga
      setTimeout(() => {
        this.router.navigateByUrl('/tabs/today', { replaceUrl: true });
      }, 1500);
      
    } catch (error) {
      console.error('Error al guardar la tarea', error);
      this.toastMessage = 'Error al guardar la tarea';
      this.showToast = true;
    } finally {
      this.isLoading = false;
    }
  }
}