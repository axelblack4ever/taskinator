// src/app/methodologies/three-three-three/three-three-three.page.ts
// versión 2.0.0 - 2025-04-08
import { Component, OnInit } from '@angular/core';
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
  IonCol,
  IonSpinner,
  IonModal,
  ModalController
} from '@ionic/angular/standalone';
import { TaskCardComponent } from './task-card/task-card.component';
import { TaskModalComponent } from './task-modal/task-modal.component';
import { TaskSwapModalComponent } from './task-swap-modal/task-swap-modal.component';
import { SectionHeaderComponent } from './section-header/section-header.component';
import { SectionContentComponent } from './section-content/section-content.component';
import { TaskService } from '../../services/task.service';
import { TaskDetailResponse, TaskType } from '../../models/task.model';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-three-three-three',
  templateUrl: './three-three-three.page.html',
  styleUrls: ['./three-three-three.page.scss'],
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
    IonSpinner,
    IonModal,
    TaskCardComponent,
    TaskModalComponent,
    TaskSwapModalComponent,
    SectionHeaderComponent,
    SectionContentComponent
  ]
})
export class ThreeThreeThreePage implements OnInit {
  // Propiedades para almacenar las tareas filtradas por tipo
  deepWorkTasks: TaskDetailResponse[] = [];
  impulseTasks: TaskDetailResponse[] = [];
  maintenanceTasks: TaskDetailResponse[] = [];
  
  // Flag para controlar el estado de carga
  isLoading = true;
  
  // Propiedades para modales
  selectedTask: TaskDetailResponse | null = null;
  isModalOpen = false;
  isSwapModalOpen = false;
  swapTaskType: TaskType | null = null;
  
  // Constantes para los tipos de tareas
  readonly TASK_TYPE = TaskType;

  constructor(
    private taskService: TaskService,
    private modalController: ModalController,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    // Cargar las tareas cuando se inicializa el componente
    console.log('ThreeThreeThreePage - ngOnInit: Iniciando carga de tareas...');
    this.loadTasksFromDatabase();
  }
  
  /**
   * Carga todas las tareas directamente desde la base de datos
   */
  async loadTasksFromDatabase() {
    this.isLoading = true;
    
    try {
      console.log('Cargando tareas directamente desde la base de datos...');
      
      // Hacer consulta directa a Supabase para obtener todas las tareas
      const { data, error } = await this.supabaseService.client
        .from('tasks')
        .select(`
          *,
          category:category_id (
            id,
            name,
            color
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No se encontraron tareas en la base de datos.');
        this.isLoading = false;
        return;
      }
      
      console.log(`Se encontraron ${data.length} tareas en la base de datos.`);
      
      // Procesar los datos para el formato esperado
      const processedTasks = data.map(task => {
        return {
          ...task,
          category_name: task.category?.name,
          category_color: task.category?.color,
          // Garantizar que se asigna un tipo de tarea si no tiene uno
          task_type: task.task_type || TaskType.DeepWork
        } as TaskDetailResponse;
      });
      
      // Filtrar y ordenar tareas por tipo
      this.deepWorkTasks = this.filterAndSortTasksByType(processedTasks, TaskType.DeepWork);
      this.impulseTasks = this.filterAndSortTasksByType(processedTasks, TaskType.Impulse);
      this.maintenanceTasks = this.filterAndSortTasksByType(processedTasks, TaskType.Maintenance);
      
      console.log('Tareas filtradas y ordenadas:', {
        deepWork: this.deepWorkTasks.length,
        impulse: this.impulseTasks.length,
        maintenance: this.maintenanceTasks.length
      });
      
    } catch (error) {
      console.error('Error al cargar las tareas desde la base de datos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Filtra y ordena las tareas según el tipo y los criterios establecidos
   * 1. Fecha de vencimiento (más próxima primero)
   * 2. Etiqueta frog
   * 3. Etiqueta importante
   * 4. Fecha de creación (más antigua primero)
   */
  filterAndSortTasksByType(tasks: TaskDetailResponse[], type: TaskType): TaskDetailResponse[] {
    console.log(`Filtrando tareas por tipo ${type}, total tareas: ${tasks.length}`);
    
    // Si el tipo de tarea es null o undefined en algunos registros, registrarlo para diagnóstico
    const tasksWithoutType = tasks.filter(task => task.task_type === null || task.task_type === undefined);
    if (tasksWithoutType.length > 0) {
      console.log(`Hay ${tasksWithoutType.length} tareas sin tipo definido`);
    }
    
    // Filtrar solo tareas del tipo especificado que no estén completadas
    // Si el tipo especificado es null, usamos TypeScript type assertion para manejar esto
    const filteredTasks = tasks.filter(task => {
      const isCorrectType = task.task_type === type;
      const isNotCompleted = !task.completed;
      
      // Para diagnóstico
      if (isCorrectType) {
        console.log(`Tarea encontrada del tipo correcto: ${task.title} (${task.id}), tipo: ${task.task_type}`);
      }
      
      return isCorrectType && isNotCompleted;
    });
    
    console.log(`Filtradas ${filteredTasks.length} tareas de tipo ${type}`);
    
    // Si no hay tareas del tipo especificado, buscar tareas sin tipo definido
    if (filteredTasks.length === 0 && tasksWithoutType.length > 0) {
      console.log(`No hay tareas de tipo ${type}, intentando asignar tareas sin tipo`);
      
      // Convertir hasta 3 tareas sin tipo al tipo actual
      const tasksToAssign = tasksWithoutType.slice(0, 3);
      
      // Intentar actualizar el tipo de estas tareas en la base de datos
      tasksToAssign.forEach(async task => {
        if (task.id) {
          try {
            console.log(`Asignando tipo ${type} a tarea ${task.id}`);
            await this.taskService.updateTask(task.id, { task_type: type });
            
            // Actualizar el tipo localmente también
            task.task_type = type;
          } catch (error) {
            console.error(`Error al actualizar el tipo de tarea ${task.id}:`, error);
          }
        }
      });
      
      // Devolver estas tareas actualizadas
      return tasksToAssign;
    }
    
    // Ordenar las tareas según los criterios establecidos
    return filteredTasks.sort((a, b) => {
      // 1. Primero ordenar por fecha de vencimiento (más próxima primero)
      if (a.due_date && b.due_date) {
        const dateA = new Date(a.due_date).getTime();
        const dateB = new Date(b.due_date).getTime();
        if (dateA !== dateB) {
          return dateA - dateB;
        }
      } else if (a.due_date) {
        return -1; // a tiene fecha, b no
      } else if (b.due_date) {
        return 1; // b tiene fecha, a no
      }
      
      // 2. Luego por etiqueta "frog"
      if (a.is_frog !== b.is_frog) {
        return a.is_frog ? -1 : 1;
      }
      
      // 3. Luego por etiqueta "importante"
      if (a.is_important !== b.is_important) {
        return a.is_important ? -1 : 1;
      }
      
      // 4. Finalmente por fecha de creación (más antigua primero)
      if (a.created_at && b.created_at) {
        const createdA = new Date(a.created_at).getTime();
        const createdB = new Date(b.created_at).getTime();
        return createdA - createdB;
      }
      
      return 0;
    });
  }

  /**
   * Obtiene las tareas disponibles para intercambio (del mismo tipo y no completadas)
   */
  getAvailableTasksForSwap(taskType: TaskType): TaskDetailResponse[] {
    // Obtener todas las tareas no completadas
    const allTasks = this.taskService.currentOverdueAndTodayTasks.filter(task => !task.completed);
    
    // Si no hay tareas, intentar con todas las tareas del sistema
    const tasksToFilter = allTasks.length > 0 ? allTasks : this.taskService.currentTasks;
    
    // Filtrar tareas que tengan el mismo tipo (para evitar intercambios entre categorías)
    // Si hay pocas tareas en total, mostrar todas para permitir al menos alguna opción de intercambio
    const filteredByType = tasksToFilter.filter(task => {
      // Si ya tiene el mismo tipo que buscamos, excluirla para evitar redundancia
      if (task.task_type === taskType) {
        return false;
      }
      
      // Excluir la tarea seleccionada
      if (this.selectedTask && task.id === this.selectedTask.id) {
        return false;
      }
      
      // Si es una tarea completada, excluirla
      if (task.completed) {
        return false;
      }
      
      return true;
    });
    
    console.log(`Encontradas ${filteredByType.length} tareas disponibles para intercambio con tipo ${taskType}`);
    
    // Devolver las tareas filtradas
    return filteredByType;
  }
  
  /**
   * Abre el modal de detalles para una tarea
   */
  async openTaskDetails(task: TaskDetailResponse) {
    this.selectedTask = task;
    this.isModalOpen = true;
  }
  
  /**
   * Cierra el modal de detalles
   */
  closeTaskDetails() {
    console.log("Cerrando modal de detalles de tarea");
    this.isModalOpen = false;
    this.selectedTask = null;
  }
  
  /**
   * Abre el modal para intercambiar una tarea
   */
  async openSwapTaskModal(task: TaskDetailResponse, taskType: TaskType) {
    this.selectedTask = task;
    this.swapTaskType = taskType;
    this.isSwapModalOpen = true;
  }
  
  /**
   * Cierra el modal de intercambio de tareas
   */
  closeSwapTaskModal() {
    console.log("Cerrando modal de intercambio de tareas");
    this.isSwapModalOpen = false;
    this.selectedTask = null;
    this.swapTaskType = null;
  }
  
  /**
   * Intercambia una tarea por otra
   */
  async swapTask(newTask: TaskDetailResponse) {
    if (!this.selectedTask || !this.swapTaskType) {
      return;
    }
    
    console.log(`Intercambiando tarea ${newTask.id} a tipo ${this.swapTaskType}`);
    
    try {
      // Actualizar el tipo de tarea de la nueva tarea seleccionada
      await this.taskService.updateTask(newTask.id!, {
        task_type: this.swapTaskType
      });
      
      // Recargar las tareas para reflejar los cambios directamente desde la base de datos
      await this.loadTasksFromDatabase();
      
      // Cerrar el modal de intercambio
      this.closeSwapTaskModal();
    } catch (error) {
      console.error('Error al intercambiar tarea:', error);
    }
  }
  
  /**
   * Marca una tarea como completada
   */
  async markTaskAsCompleted(task: TaskDetailResponse) {
    try {
      await this.taskService.toggleTaskCompletion(task.id!, true);
      
      // Recargar las tareas para reflejar los cambios
      await this.loadTasksFromDatabase();
      
      // Cerrar el modal de detalles si está abierto
      if (this.isModalOpen) {
        this.closeTaskDetails();
      }
    } catch (error) {
      console.error('Error al marcar tarea como completada:', error);
    }
  }
}