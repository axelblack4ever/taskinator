// src/app/tasks/new-task/new-task.page.ts
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
  IonIcon,
  IonCheckbox,
  IonChip,
  IonPopover
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  calendar, 
  flag, 
  save, 
  informationCircle, 
  checkmark,
  business,
  rocket,
  construct,
  alertCircleOutline,
  heart,
  cash,
  people,
  school,
  briefcase
} from 'ionicons/icons';

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
    IonIcon,
    IonCheckbox,
    IonChip,
    IonPopover
  ]
})
export class NewTaskPage implements OnInit {
  
  newTask = {
    title: '',
    description: '',
    category_id: null as number | null,
    due_date: new Date().toISOString().split('T')[0],
    priority: 0,
    // Se ha eliminado el campo methodology
    // Nuevos campos
    task_type: null as string | null,
    isFrog: false,
    isImportant: false,
    relation_category: null as string | null,
    tags: [] as string[]
  };
  
  // Datos de ejemplo para categorías
  categories: any[] = [
    { id: 1, name: 'Personal', color: '#FF5733' },
    { id: 2, name: 'Trabajo', color: '#33A1FF' },
    { id: 3, name: 'Estudios', color: '#33FF57' }
  ];

  // Tipos de tarea con descripciones
  taskTypes = [
    { 
      value: 'deep_work', 
      label: 'Trabajo Profundo',
      icon: 'business',
      description: 'Tareas que requieren alta concentración, creatividad y esfuerzo mental sostenido. Enfocado en proyectos de largo plazo y resultados significativos.'
    },
    { 
      value: 'impulse', 
      label: 'Tareas de Impulso',
      icon: 'rocket',
      description: 'Acciones que generan avances tangibles y respuestas inmediatas. Enfocado en el progreso diario y la resolución de problemas puntuales.'
    },
    { 
      value: 'maintenance', 
      label: 'Mantenimiento',
      icon: 'construct',
      description: 'Tareas rutinarias y administrativas que mantienen el flujo de trabajo. Enfocado en la organización, la comunicación y la gestión de tareas menores.'
    }
  ];

  // Categorías de relaciones
  relationCategories = [
    { value: 'personal', label: 'Personal' },
    { value: 'partner', label: 'Pareja' },
    { value: 'children', label: 'Hijos' },
    { value: 'family', label: 'Familia' },
    { value: 'friends', label: 'Amigos' },
    { value: 'others', label: 'Otros' }
  ];

  // Etiquetas disponibles
  availableTags = [
    { value: 'health', label: 'Salud', icon: 'heart' },
    { value: 'finances', label: 'Finanzas', icon: 'cash' },
    { value: 'relationships', label: 'Relaciones personales', icon: 'people' },
    { value: 'personal_growth', label: 'Desarrollo personal', icon: 'school' },
    { value: 'work', label: 'Trabajo', icon: 'briefcase' }
  ];
  
  isLoading = false;
  showToast = false;
  toastMessage = '';
  
  constructor(private router: Router) {
    addIcons({
      calendar,
      flag,
      save,
      informationCircle,
      checkmark,
      business,
      rocket,
      construct,
      alertCircleOutline,
      heart,
      cash,
      people,
      school,
      briefcase
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

  toggleTag(tagValue: string) {
    const index = this.newTask.tags.indexOf(tagValue);
    if (index === -1) {
      this.newTask.tags.push(tagValue);
    } else {
      this.newTask.tags.splice(index, 1);
    }
  }

  isTagSelected(tagValue: string): boolean {
    return this.newTask.tags.includes(tagValue);
  }

  getTaskTypeDescription(typeValue: string): string {
    const type = this.taskTypes.find(t => t.value === typeValue);
    return type ? type.description : '';
  }
}