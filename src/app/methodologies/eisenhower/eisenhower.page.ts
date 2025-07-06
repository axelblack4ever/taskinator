// src/app/methodologies/eisenhower/eisenhower.page.ts
// versión 2.2.0 - 2025-05-14
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton,
  IonSpinner,
  ModalController,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  informationCircleOutline,
  timeOutline,
  calendarOutline,
  alertCircleOutline,
  closeOutline,
  refreshOutline,
  checkmarkCircleOutline,
  add
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { QuadrantInfoComponent } from './components/quadrant-info/quadrant-info.component';
import { TaskDetailComponent } from './components/task-detail/task-detail.component';
import { EisenhowerService, EisenhowerMatrix } from '../../services/eisenhower.service';
import { TaskDetailResponse } from '../../models/task.model';

@Component({
  selector: 'app-eisenhower',
  templateUrl: './eisenhower.page.html',
  styleUrls: ['./eisenhower.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons,
    IonMenuButton,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonButton,
    IonSpinner,
    QuadrantInfoComponent,
    TaskDetailComponent
  ]
})
export class EisenhowerPage implements OnInit, OnDestroy {
  // Datos de tareas
  matrixTasks: EisenhowerMatrix = {
    quadrant1: [],
    quadrant2: [],
    quadrant3: [],
    quadrant4: []
  };
  
  // Flag para tareas vencidas
  hasOverdueTasks = false;
  overdueTasks: TaskDetailResponse[] = [];
  
  // Estado de carga
  isLoading = true;
  
  // Control de modales y popovers
  selectedTask: TaskDetailResponse | null = null;
  selectedQuadrant: number = 0;
  
  // Suscripciones
  private matrixSubscription: Subscription | null = null;
  private overdueSubscription: Subscription | null = null;
  private loadingSubscription: Subscription | null = null;

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController,
    private eisenhowerService: EisenhowerService
  ) {
    addIcons({
      refreshOutline,
      alertCircleOutline,
      closeOutline,
      informationCircleOutline,
      calendarOutline,
      checkmarkCircleOutline,
      add,
      timeOutline
    });
  }

  // Variable para controlar si la alerta ya se ha cerrado manualmente
  private alertDismissed = false;
  
  ngOnInit() {
    // Suscribirse a cambios en las tareas de la matriz
    this.matrixSubscription = this.eisenhowerService.matrixTasks$.subscribe(tasks => {
      this.matrixTasks = tasks;
    });
    
    // Suscribirse a cambios en las tareas vencidas
    this.overdueSubscription = this.eisenhowerService.overdueTasks$.subscribe(tasks => {
      // Solo actualizar el estado si la alerta no ha sido descartada manualmente
      if (!this.alertDismissed) {
        this.overdueTasks = tasks;
        this.hasOverdueTasks = tasks.length > 0;
      }
    });
    
    // Suscribirse al estado de carga
    this.loadingSubscription = this.eisenhowerService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
    
    // Cargar datos iniciales
    this.refreshMatrix();
  }
  
  ngOnDestroy() {
    // Cancelar suscripciones
    if (this.matrixSubscription) {
      this.matrixSubscription.unsubscribe();
    }
    
    if (this.overdueSubscription) {
      this.overdueSubscription.unsubscribe();
    }
    
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }
  
  /**
   * Actualiza la matriz de Eisenhower
   */
  async refreshMatrix() {
    try {
      await this.eisenhowerService.refreshMatrix();
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      this.showErrorToast('Error al cargar las tareas');
    }
  }

  // El método showOverdueTasksInfo ya no se utiliza
  // Se deja comentado por si se necesita referencia en el futuro
  /*
  async showOverdueTasksInfo() {
    const alert = await this.alertController.create({
      header: 'Tareas Vencidas',
      message: `Tienes ${this.overdueTasks.length} ${this.overdueTasks.length === 1 ? 'tarea vencida' : 'tareas vencidas'} que no se muestran en la matriz. Revisa la página principal para gestionar estas tareas.`,
      buttons: [
        {
          text: 'Entendido',
          handler: () => {
            console.log('Botón Entendido pulsado');
            return true;
          }
        }
      ]
    });
    
    await alert.present();
  }
  */

  /**
   * Muestra información sobre un cuadrante
   */
  async showQuadrantInfo(quadrant: number, event: Event) {
    event.stopPropagation();
    this.selectedQuadrant = quadrant;
    
    // Presentar modal con información del cuadrante
    const modal = await this.modalController.create({
      component: QuadrantInfoComponent,
      componentProps: {
        quadrantNumber: quadrant
      },
      cssClass: 'quadrant-info-modal'
    });
    
    await modal.present();
  }

  /**
   * Maneja el click en una tarea para mostrar detalles
   */
  async onTaskClick(task: TaskDetailResponse) {
    this.selectedTask = task;
    
    // Presentar modal de detalles de tarea
    const modal = await this.modalController.create({
      component: TaskDetailComponent,
      componentProps: {
        task: task
      },
      cssClass: 'task-detail-modal'
    });
    
    // Configurar evento para cuando se cierre el modal
    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.completed) {
        this.completeTask(task);
      }
      this.selectedTask = null;
    });
    
    await modal.present();
  }
  
  /**
   * Marca una tarea como completada
   */
  async completeTask(task: TaskDetailResponse) {
    if (!task.id) return;
    
    try {
      await this.eisenhowerService.completeTask(task.id);
      
      // Mostrar confirmación
      const toast = await this.toastController.create({
        message: `Tarea "${task.title}" completada`,
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
    } catch (error) {
      console.error('Error al completar tarea:', error);
      this.showErrorToast('Error al completar la tarea');
    }
  }
  
  /**
   * Oculta la alerta de tareas vencidas y evita que aparezca nuevamente
   */
  dismissOverdueAlert() {
    this.hasOverdueTasks = false;
    this.alertDismissed = true; // Marcar la alerta como descartada permanentemente
  }
  
  /**
   * Muestra un toast de error
   */
  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }
  
  /**
   * Formatea una fecha para mostrarla de forma amigable
   * @param dateString La fecha a formatear (puede ser undefined)
   * @returns Una cadena con la fecha formateada
   */
  formatDate(dateString?: string): string {
    // Si no hay fecha, devolver un texto por defecto
    if (!dateString) return 'Sin fecha';
    
    const date = new Date(dateString);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    
    if (dateObj.getTime() === today.getTime()) {
      return 'Hoy';
    } else if (dateObj.getTime() === tomorrow.getTime()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString();
    }
  }
}