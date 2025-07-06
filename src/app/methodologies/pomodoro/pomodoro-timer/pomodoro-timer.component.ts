// src/app/methodologies/pomodoro/components/pomodoro-timer/pomodoro-timer.component.ts
// versión 1.0.0 - 2025-04-04
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonButton,
  IonIcon,
  IonLabel,
  IonChip
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  play, 
  pause, 
  stop, 
  caretForward,
  time
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { PomodoroService, PomodoroState, PomodoroStatus } from 'src/app/services/pomodoro.service';

@Component({
  selector: 'app-pomodoro-timer',
  templateUrl: './pomodoro-timer.component.html',
  styleUrls: ['./pomodoro-timer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonLabel,
    IonChip
  ]
})
export class PomodoroTimerComponent implements OnInit, OnDestroy {
  // Para acceder a los enum en la plantilla
  PomodoroState = PomodoroState;
  
  // Estado actual del temporizador
  status: PomodoroStatus | null = null;

  // Para suscripción
  private statusSubscription?: Subscription;
  
  constructor(private pomodoroService: PomodoroService) {
    // Registrar los iconos necesarios
    addIcons({
      play,
      pause,
      stop,
      caretForward,
      time
    });
  }

  ngOnInit() {
    // Suscribirse al estado del pomodoro
    this.statusSubscription = this.pomodoroService.status$.subscribe((status: PomodoroStatus) => {
      this.status = status;
    });
  }

  ngOnDestroy() {
    // Limpieza de suscripciones
    this.statusSubscription?.unsubscribe();
  }

  // Métodos para controlar el temporizador
  startTimer() {
    this.pomodoroService.startTimer();
  }

  pauseTimer() {
    this.pomodoroService.pauseTimer();
  }

  resetTimer() {
    this.pomodoroService.resetTimer();
  }

  skipToNext() {
    this.pomodoroService.skipToNext();
  }

  // Formatear tiempo para mostrar (mm:ss)
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Obtener el título según el estado actual
  getStateTitle(): string {
    if (!this.status) return 'Pomodoro';
    
    switch (this.status.state) {
      case PomodoroState.WORK:
        return 'Tiempo de Trabajo';
      case PomodoroState.SHORT_BREAK:
        return 'Descanso Corto';
      case PomodoroState.LONG_BREAK:
        return 'Descanso Largo';
      case PomodoroState.PAUSED:
        return 'Pausado';
      default:
        return 'Pomodoro';
    }
  }

  // Obtener color según el estado
  getStateColor(): string {
    if (!this.status) return 'primary';
    
    switch (this.status.state) {
      case PomodoroState.WORK:
        return 'danger';
      case PomodoroState.SHORT_BREAK:
        return 'success';
      case PomodoroState.LONG_BREAK:
        return 'tertiary';
      case PomodoroState.PAUSED:
        return 'warning';
      default:
        return 'primary';
    }
  }

  // Calcular el porcentaje para la barra de progreso
  getProgressPercentage(): number {
    if (!this.status || this.status.totalTime === 0) return 0;
    return (1 - (this.status.timeRemaining / this.status.totalTime)) * 100;
  }
}