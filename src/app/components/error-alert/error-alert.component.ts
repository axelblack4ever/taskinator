// src/app/components/error-alert/error-alert.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonAlert,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircle, close } from 'ionicons/icons';
import { AppError, ErrorType } from '../../services/error.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-error-alert',
  template: `
    <ion-card *ngIf="visible" class="error-alert" [ngClass]="errorTypeClass">
      <ion-button fill="clear" class="close-btn" (click)="dismiss()">
        <ion-icon name="close"></ion-icon>
      </ion-button>
      <ion-card-header>
        <ion-card-title>
          <ion-icon name="alert-circle" class="alert-icon"></ion-icon>
          {{ errorTitle }}
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <p>{{ message }}</p>
        <div class="details" *ngIf="showDetails && details">
          <p class="details-title">Detalles técnicos:</p>
          <p class="details-content">{{ details }}</p>
        </div>
        <ion-button 
          *ngIf="details" 
          fill="clear" 
          size="small" 
          (click)="toggleDetails()"
          class="details-toggle">
          {{ showDetails ? 'Ocultar detalles' : 'Mostrar detalles' }}
        </ion-button>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .error-alert {
      margin: 16px;
      border-left: 4px solid var(--ion-color-danger);
      position: relative;
    }
    
    .error-alert.error-auth {
      border-left-color: var(--ion-color-warning);
    }
    
    .error-alert.error-network {
      border-left-color: var(--ion-color-tertiary);
    }
    
    .error-alert.error-validation {
      border-left-color: var(--ion-color-medium);
    }
    
    .close-btn {
      position: absolute;
      top: 5px;
      right: 5px;
      margin: 0;
      --padding-start: 6px;
      --padding-end: 6px;
      height: 30px;
    }
    
    .alert-icon {
      margin-right: 8px;
      vertical-align: middle;
    }
    
    .details {
      margin-top: 10px;
      background-color: rgba(var(--ion-color-medium-rgb), 0.1);
      padding: 8px;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    
    .details-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .details-content {
      margin: 0;
      word-break: break-word;
    }
    
    .details-toggle {
      margin-top: 8px;
      --color: var(--ion-color-medium);
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonAlert,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle
  ]
})
export class ErrorAlertComponent implements OnInit, OnDestroy {
  @Input() error: AppError | null = null;
  @Input() message: string = '';
  @Input() details: string = '';
  @Input() type: ErrorType = ErrorType.UNKNOWN;
  @Input() autoDismiss: boolean = true;
  @Input() dismissTimeout: number = 8000; // 8 segundos

  visible = true;
  showDetails = false;
  errorTypeClass = '';
  errorTitle = 'Error';
  
  private dismissTimer$: Subscription | null = null;

  constructor() {
    addIcons({ alertCircle, close });
  }

  ngOnInit() {
    if (this.error) {
      this.message = this.error.message;
      this.type = this.error.type;
      this.details = this.error.originalError?.message || JSON.stringify(this.error.originalError);
    }

    this.setTitleAndClass();
    
    if (this.autoDismiss) {
      this.dismissTimer$ = timer(this.dismissTimeout).subscribe(() => {
        this.visible = false;
      });
    }
  }
  
  ngOnDestroy() {
    if (this.dismissTimer$) {
      this.dismissTimer$.unsubscribe();
    }
  }
  
  dismiss() {
    this.visible = false;
  }
  
  toggleDetails() {
    this.showDetails = !this.showDetails;
  }
  
  private setTitleAndClass() {
    this.errorTypeClass = `error-${this.type}`;
    
    switch (this.type) {
      case ErrorType.AUTH:
        this.errorTitle = 'Error de autenticación';
        break;
      case ErrorType.DATABASE:
        this.errorTitle = 'Error de base de datos';
        break;
      case ErrorType.NETWORK:
        this.errorTitle = 'Error de conexión';
        break;
      case ErrorType.VALIDATION:
        this.errorTitle = 'Error de validación';
        break;
      default:
        this.errorTitle = 'Error';
    }
  }
}