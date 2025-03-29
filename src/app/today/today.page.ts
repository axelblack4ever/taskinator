// src/app/today/today.page.ts
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
  ToastController,
  AnimationController,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonItemDivider,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  refresh, 
  add, 
  create, 
  trash, 
  checkmarkCircle, 
  chevronDownCircle,
  calendar
} from 'ionicons/icons';
import { TaskService } from '../services/task.service';
import { TaskDetailResponse } from '../models/task.model';
import { Subscription, interval } from 'rxjs';
import { FilterTasksPipe } from '../pipes/filter-tasks.pipe';

@Component({
  selector: 'app-today',
  templateUrl: './today.page.html',
  styleUrls: ['./today.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterLink,
    FilterTasksPipe,
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
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonIcon,
    IonItemDivider,
    IonFab,
    IonFabButton
  ]
})
export class TodayPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;
  @ViewChild(IonRefresher) refresher!: IonRefresher;
  
  todayAndOverdueTasks: TaskDetailResponse[] = [];
  isLoading = false;
  refreshingTasks = false;
  lastRefresh: Date = new Date();
  private subscriptions: Subscription[] = [];
  private autoRefreshSubscription: Subscription | null = null;
  
  // Propiedades auxiliares para la plantilla
  hasOverdueTasks = false;
  hasTodayTasks = false;
  hasCompletedTasks = false;
  
  constructor(
    private taskService: TaskService,
    private toastController: ToastController,
    private animationCtrl: AnimationController
  ) {
    // Registrar los iconos necesarios
    addIcons({
      refresh,
      add,
      create,
      trash,
      checkmarkCircle,
      chevronDownCircle,
      calendar
    });
  }

  ngOnInit() {
    // Suscribirse a los cambios en las tareas de hoy y vencidas
    this.subscriptions.push(
      this.taskService.overdueAndTodayTasks$.subscribe(tasks => {
        this.todayAndOverdueTasks = tasks;
        
        // Actualizar flags para la plantilla
        this.updateTaskFlags();
                
        this.refreshingTasks = false;
        this.lastRefresh = new Date();
      })
    );
    
    // Suscribirse al estado de carga
    this.subscriptions.push(
      this.taskService.loading$.subscribe(loading => {
        this.isLoading = loading;
      })
    );
    
    // Cargar las tareas de hoy y vencidas
    this.loadTodayAndOverdueTasks();
    
    // Configurar actualización automática cada 15 minutos
    this.setupAutoRefresh();
  }
  
  ngOnDestroy() {
    // Limpiar suscripciones al destruir el componente
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
  }
  
  // Actualiza los flags usados en la plantilla
  updateTaskFlags() {
    this.hasOverdueTasks = this.todayAndOverdueTasks.some(
      t => t.is_overdue === true && !t.completed
    );
    
    this.hasTodayTasks = this.todayAndOverdueTasks.some(
      t => !t.is_overdue && !t.completed
    );
    
    this.hasCompletedTasks = this.todayAndOverdueTasks.some(
      t => t.completed
    );
  }
  
  // Configurar actualización automática periódica
  setupAutoRefresh() {
    const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutos en milisegundos
    
    this.autoRefreshSubscription = interval(REFRESH_INTERVAL)
      .subscribe(() => {
        // Solo actualizar automáticamente si la página está visible
        if (document.visibilityState === 'visible') {
          this.silentRefresh();
        }
      });
      
    // También actualizar cuando la pestaña vuelve a estar visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Solo actualizar si han pasado al menos 5 minutos desde la última actualización
        const timeSinceLastRefresh = new Date().getTime() - this.lastRefresh.getTime();
        if (timeSinceLastRefresh > 5 * 60 * 1000) {
          this.silentRefresh();
        }
      }
    });
  }
  
  // Actualización silenciosa (sin indicadores de carga)
  async silentRefresh() {
    this.refreshingTasks = true;
    try {
      await this.taskService.loadOverdueAndTodayTasks();
    } catch (error) {
      console.error('Error actualizando tareas:', error);
      // No mostrar toast en actualizaciones silenciosas
    }
  }
  
  async loadTodayAndOverdueTasks() {
    try {
      await this.taskService.loadOverdueAndTodayTasks();
    } catch (error) {
      console.error('Error cargando tareas de hoy y vencidas:', error);
      this.showToast('Error al cargar las tareas');
    }
  }
  
  async doRefresh(event: any) {
    try {
      this.refreshingTasks = true;
      await this.taskService.loadOverdueAndTodayTasks();
    } catch (error) {
      console.error('Error actualizando tareas:', error);
      this.showToast('Error al actualizar las tareas');
    } finally {
      event.target.complete();
    }
  }
  
  async markAsComplete(taskId: number) {
    const task = this.todayAndOverdueTasks.find(t => t.id === taskId);
    if (task) {
      try {
        // Determinar el nuevo estado - la negación del estado actual
        const newCompletedState = !task.completed;
        
        // Animar el item para que el usuario tenga feedback visual
        this.animateTaskCompletion(taskId, newCompletedState);
        
        // Actualizar en la base de datos
        await this.taskService.toggleTaskCompletion(taskId, newCompletedState);
        
        // Mostrar mensaje si la tarea se completó
        if (newCompletedState) {
          this.showToast('¡Tarea completada!', 'success');
        }
      } catch (error) {
        console.error('Error actualizando tarea:', error);
        this.showToast('Error al actualizar la tarea', 'danger');
      }
    }
  }
  
  /**
   * Anima visualmente la completitud de una tarea
   */
  animateTaskCompletion(taskId: number, completed: boolean) {
    // Obtener el elemento DOM de la tarea
    const taskElement = document.getElementById(`task-${taskId}`);
    if (!taskElement) return;
    
    if (completed) {
      // Añadir clase de animación temporalmente
      taskElement.classList.add('completed-animation');
      
      // Eliminar la clase después de que termine la animación
      setTimeout(() => {
        taskElement.classList.remove('completed-animation');
      }, 500); // Debe coincidir con la duración de la animación CSS
    } else {
      // Animación para cuando se desmarca como completada
      const animation = this.animationCtrl.create()
        .addElement(taskElement)
        .duration(300)
        .keyframes([
          { offset: 0, transform: 'scale(1)' },
          { offset: 0.5, transform: 'scale(1.05)' },
          { offset: 1, transform: 'scale(1)' }
        ]);
      
      animation.play();
    }
  }
  
  /**
   * Determina si una tarea debe mostrar el texto en rojo (vencida y no completada)
   */
  isOverdue(task: TaskDetailResponse): boolean {
    return !!task.is_overdue && !task.completed;
  }
  
  /**
   * Editar una tarea
   */
  editTask(taskId: number | undefined, slidingItem?: IonItemSliding) {
    if (!taskId) return;
    
    if (slidingItem) {
      slidingItem.close();
    }
    
    // Aquí navegaríamos a la página de edición de la tarea
    // Por ahora solo mostramos un mensaje
    this.showToast('Función de edición pendiente de implementar', 'warning');
  }
  
  /**
   * Eliminar una tarea
   */
  async deleteTask(taskId: number | undefined, slidingItem?: IonItemSliding) {
    if (!taskId) return;
    
    if (slidingItem) {
      slidingItem.close();
    }
    
    try {
      await this.taskService.deleteTask(taskId);
      this.showToast('Tarea eliminada correctamente', 'success');
    } catch (error) {
      console.error('Error eliminando tarea:', error);
      this.showToast('Error al eliminar la tarea', 'danger');
    }
  }
  
  /**
   * Método para formatear fechas relativas (hoy, ayer, etc.)
   */
  formatRelativeDate(dateString: string | undefined): string {
    if (!dateString) return '';
    
    const taskDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Comparar solo las fechas sin la hora
    const taskDateString = taskDate.toISOString().split('T')[0];
    const todayString = today.toISOString().split('T')[0];
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    if (taskDateString === todayString) {
      return 'Hoy';
    } else if (taskDateString === yesterdayString) {
      return 'Ayer';
    } else {
      return taskDate.toLocaleDateString();
    }
  }
  
  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}