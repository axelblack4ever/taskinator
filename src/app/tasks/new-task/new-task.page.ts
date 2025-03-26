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
  IonPopover,
  IonSpinner
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
  construct
} from 'ionicons/icons';
import { TaskService } from '../../services/task.service';
import { ErrorService } from '../../services/error.service';
import { CreateTaskRequest, TaskPriority, TaskType } from '../../models/task.model';

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
    IonPopover,
    IonSpinner
  ]
})
export class NewTaskPage implements OnInit {
  
  newTask = {
    title: '',
    description: '',
    category_id: null as number | null,
    due_date: new Date().toISOString().split('T')[0],
    priority: 0,
    task_type: null as string | null,
    isImportant: false,
    isFrog: false,
    tags: [] as string[]
  };
  
  // Datos de ejemplo para categorías - en un caso real, vendrían de un servicio
  categories: any[] = [
    { id: 1, name: 'Personal', color: '#FF5733' },
    { id: 2, name: 'Trabajo', color: '#33A1FF' },
    { id: 3, name: 'Estudios', color: '#33FF57' },
    { id: 4, name: 'Familia', color: '#8A33FF' },
    { id: 5, name: 'Amigos', color: '#FF33A8' },
    { id: 6, name: 'Pareja', color: '#FF3355' }
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

  // Etiquetas disponibles
  availableTags = [
    { value: 'health', label: 'Salud' },
    { value: 'finances', label: 'Finanzas' },
    { value: 'relationships', label: 'Relaciones personales' },
    { value: 'personal_growth', label: 'Desarrollo personal' },
    { value: 'work', label: 'Trabajo' }
  ];
  
  isLoading = false;
  showToast = false;
  toastMessage = '';
  
  constructor(
    private router: Router,
    private taskService: TaskService,
    private errorService: ErrorService
  ) {
    addIcons({
      calendar,
      flag,
      save,
      informationCircle,
      checkmark,
      business,
      rocket,
      construct
    });
  }

  ngOnInit() {
    console.log('NewTaskPage initialized');
    // Aquí cargaríamos las categorías desde un servicio de categorías
  }
  
  async saveTask() {
    if (!this.newTask.title.trim()) {
      this.toastMessage = 'El título es obligatorio';
      this.showToast = true;
      return;
    }
    
    this.isLoading = true;
    
    try {
      // Convertir los datos del formulario al formato requerido por el servicio
      const taskRequest: CreateTaskRequest = {
        title: this.newTask.title,
        description: this.newTask.description || undefined,
        due_date: this.newTask.due_date,
        priority: this.newTask.priority as TaskPriority,
        category_id: this.newTask.category_id || undefined,
        task_type: this.newTask.task_type as TaskType || undefined,
        is_important: this.newTask.isImportant,
        is_frog: this.newTask.isFrog,
        tags: this.newTask.tags.length > 0 ? this.newTask.tags : undefined
      };
      
      // Guardar la tarea utilizando el servicio
      const createdTask = await this.taskService.createTask(taskRequest);
      
      this.toastMessage = 'Tarea creada correctamente';
      this.showToast = true;
      
      // Navegar a la página anterior
      setTimeout(() => {
        this.router.navigateByUrl('/tabs/today', { replaceUrl: true });
      }, 1500);
      
    } catch (error) {
      // El error ya ha sido manejado en el servicio, no necesitamos hacer nada más aquí
      console.error('Error al crear la tarea:', error);
    } finally {
      this.isLoading = false;
    }
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