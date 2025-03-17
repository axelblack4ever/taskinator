import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonToast,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendar, flag, save } from 'ionicons/icons';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.page.html',
  styleUrls: ['./new-task.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
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
  
  // Datos de ejemplo para categorías
  categories: any[] = [
    { id: 1, name: 'Personal', color: '#FF5733' },
    { id: 2, name: 'Trabajo', color: '#33A1FF' },
    { id: 3, name: 'Estudios', color: '#33FF57' }
  ];
  
  isLoading = false;
  showToast = false;
  toastMessage = '';
  
  constructor(private router: Router) {
    addIcons({
      calendar,
      flag,
      save
    });
  }

  ngOnInit() {
    console.log('NewTaskPage initialized');
  }
  
  saveTask() {
    if (!this.newTask.title.trim()) {
      this.toastMessage = 'El título es obligatorio';
      this.showToast = true;
      return;
    }
    
    this.isLoading = true;
    
    // Simulamos el guardado
    setTimeout(() => {
      this.isLoading = false;
      this.toastMessage = 'Tarea creada correctamente';
      this.showToast = true;
      
      // Navegar a la página anterior
      setTimeout(() => {
        this.router.navigateByUrl('/tabs/today', { replaceUrl: true });
      }, 1500);
    }, 1000);
  }
}