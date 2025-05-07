// src/app/methodologies/eisenhower/components/quadrant-info/quadrant-info.component.ts
// versión 1.2.0 - 2025-05-06
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-quadrant-info',
  template: `
    <ion-header>
      <ion-toolbar [color]="quadrantColor">
        <ion-title>{{ quadrantTitle }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h2>{{ quadrantTitle }}</h2>
      <p>{{ quadrantDescription }}</p>
      
      <h3>Características:</h3>
      <ion-list lines="none">
        <ion-item *ngFor="let item of characteristics">
          <ion-label>• {{ item }}</ion-label>
        </ion-item>
      </ion-list>
      
      <h3>Recomendaciones:</h3>
      <ion-list lines="none">
        <ion-item *ngFor="let item of recommendations">
          <ion-label>• {{ item }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    h2 {
      margin-top: 0;
      font-size: 1.2rem;
      font-weight: 600;
    }
    h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    p {
      font-size: 0.95rem;
      line-height: 1.4;
      color: var(--ion-color-dark);
    }
    ion-item {
      --min-height: 32px;
    }
    ion-label {
      font-size: 0.9rem;
      white-space: normal;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel
  ]
})
export class QuadrantInfoComponent {
  @Input() quadrantNumber: number = 1;
  
  quadrantTitle: string = '';
  quadrantDescription: string = '';
  quadrantColor: string = '';
  characteristics: string[] = [];
  recommendations: string[] = [];
  
  constructor(private modalController: ModalController) {
    addIcons({ closeOutline });
  }
  
  ngOnInit() {
    this.setQuadrantInfo();
  }
  
  setQuadrantInfo() {
    switch(this.quadrantNumber) {
      case 1:
        this.quadrantTitle = 'Urgente e Importante';
        this.quadrantDescription = 'Este cuadrante contiene tareas críticas que requieren atención inmediata. Son actividades con fechas de vencimiento próximas y alta importancia.';
        this.quadrantColor = 'danger';
        this.characteristics = [
          'Crisis y problemas apremiantes',
          'Proyectos con plazos inminentes',
          'Actividades críticas para el éxito',
          'Emergencias genuinas'
        ];
        this.recommendations = [
          'Hacer primero',
          'Atender personalmente',
          'Minimizar interrupciones al trabajar en estas tareas',
          'Evitar llegar a esta situación mediante planificación'
        ];
        break;
      case 2:
        this.quadrantTitle = 'Importante pero No Urgente';
        this.quadrantDescription = 'Este cuadrante contiene tareas estratégicas con tiempo suficiente de planificación. Son actividades importantes pero con fechas de vencimiento más lejanas.';
        this.quadrantColor = 'success';
        this.characteristics = [
          'Planificación y preparación',
          'Desarrollo personal y profesional',
          'Construcción de relaciones',
          'Actividades de crecimiento a largo plazo'
        ];
        this.recommendations = [
          'Programar tiempo específico para estas actividades',
          'Priorizar estas tareas para evitar que se conviertan en urgentes',
          'Invertir tiempo aquí reduce tareas del primer cuadrante',
          'Estas tareas brindan mayor retorno a largo plazo'
        ];
        break;
      case 3:
        this.quadrantTitle = 'Urgente pero No Importante';
        this.quadrantDescription = 'Este cuadrante contiene tareas que requieren atención rápida pero no son cruciales para tus objetivos principales. Tienen fechas próximas pero baja importancia estratégica.';
        this.quadrantColor = 'warning';
        this.characteristics = [
          'Interrupciones y distracciones',
          'Algunas llamadas o correos',
          'Ciertas reuniones',
          'Actividades con plazos cortos pero poco valor estratégico'
        ];
        this.recommendations = [
          'Delegar cuando sea posible',
          'Minimizar o eliminar estas tareas',
          'Establecer límites para reducir interrupciones',
          'Agrupar tareas similares para eficiencia'
        ];
        break;
      case 4:
        this.quadrantTitle = 'Ni Urgente Ni Importante';
        this.quadrantDescription = 'Este cuadrante contiene actividades de baja prioridad que no contribuyen significativamente a tus objetivos. Son tareas que podrían posponerse o eliminarse.';
        this.quadrantColor = 'medium';
        this.characteristics = [
          'Actividades triviales',
          'Algunas llamadas o correos',
          'Pérdidas de tiempo',
          'Actividades de escape o procrastinación'
        ];
        this.recommendations = [
          'Eliminar o reducir al mínimo',
          'Usar como recompensas ocasionales',
          'Evaluar si realmente necesitan ser realizadas',
          'Considerar automatizar o delegar si son necesarias'
        ];
        break;
    }
  }
  
  dismiss() {
    this.modalController.dismiss();
  }
}