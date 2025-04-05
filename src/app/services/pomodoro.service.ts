// src/app/services/pomodoro.service.ts
// versión 1.0.0 - 2025-04-04
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export enum PomodoroState {
  IDLE = 'idle',
  WORK = 'work',
  SHORT_BREAK = 'shortBreak',
  LONG_BREAK = 'longBreak',
  PAUSED = 'paused'
}

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
}

export interface PomodoroStatus {
  state: PomodoroState;
  timeRemaining: number;
  totalTime: number;
  pomodorosCompleted: number;
  currentCycle: number;
}

@Injectable({
  providedIn: 'root'
})
export class PomodoroService implements OnDestroy {
  // Configuración por defecto (en segundos)
  private _settings: PomodoroSettings = {
    workDuration: 25 * 60, // 25 minutos
    shortBreakDuration: 5 * 60, // 5 minutos
    longBreakDuration: 20 * 60, // 20 minutos
    longBreakInterval: 4 // Cada 4 pomodoros
  };

  // Subjects y Observables para el estado actual
  private _status = new BehaviorSubject<PomodoroStatus>({
    state: PomodoroState.IDLE,
    timeRemaining: this._settings.workDuration,
    totalTime: this._settings.workDuration,
    pomodorosCompleted: 0,
    currentCycle: 1
  });

  // Para manejar la limpieza de suscripciones
  private destroy$ = new Subject<void>();
  private timerSubscription?: Subscription;

  constructor() {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.timerSubscription?.unsubscribe();
  }

  // Getters para los Observables
  get status$(): Observable<PomodoroStatus> {
    return this._status.asObservable();
  }

  // Getter para obtener el valor actual del estado
  get currentStatus(): PomodoroStatus {
    return this._status.getValue();
  }

  // Getter para obtener la configuración actual
  get settings(): PomodoroSettings {
    return { ...this._settings };
  }

  // Setter para actualizar la configuración
  updateSettings(newSettings: Partial<PomodoroSettings>): void {
    this._settings = { ...this._settings, ...newSettings };
    
    // Si está en estado IDLE, actualizar el tiempo restante según la nueva configuración
    const currentStatus = this._status.getValue();
    if (currentStatus.state === PomodoroState.IDLE) {
      this._status.next({
        ...currentStatus,
        timeRemaining: this._settings.workDuration,
        totalTime: this._settings.workDuration
      });
    }
  }

  // Iniciar el temporizador
  startTimer(): void {
    // Cancelar cualquier temporizador existente
    this.timerSubscription?.unsubscribe();

    const currentStatus = this._status.getValue();
    let newState = currentStatus.state;

    // Si está en IDLE o PAUSED, cambiar a WORK
    if (currentStatus.state === PomodoroState.IDLE || currentStatus.state === PomodoroState.PAUSED) {
      newState = PomodoroState.WORK;
    }

    this._status.next({
      ...currentStatus,
      state: newState
    });

    // Crear un nuevo temporizador
    this.timerSubscription = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const status = this._status.getValue();
        
        if (status.timeRemaining > 0) {
          // Actualizar tiempo restante
          this._status.next({
            ...status,
            timeRemaining: status.timeRemaining - 1
          });
        } else {
          // El temporizador ha terminado
          this.handleTimerCompleted();
        }
      });
  }

  // Pausar el temporizador
  pauseTimer(): void {
    this.timerSubscription?.unsubscribe();
    
    const currentStatus = this._status.getValue();
    if (currentStatus.state !== PomodoroState.IDLE) {
      this._status.next({
        ...currentStatus,
        state: PomodoroState.PAUSED
      });
    }
  }

  // Detener el temporizador y reiniciar
  resetTimer(): void {
    this.timerSubscription?.unsubscribe();
    
    this._status.next({
      state: PomodoroState.IDLE,
      timeRemaining: this._settings.workDuration,
      totalTime: this._settings.workDuration,
      pomodorosCompleted: 0,
      currentCycle: 1
    });
  }

  // Saltar al siguiente estado
  skipToNext(): void {
    this.timerSubscription?.unsubscribe();
    this.handleTimerCompleted();
  }

  // Manejar la finalización del temporizador
  private handleTimerCompleted(): void {
    const currentStatus = this._status.getValue();
    let newState: PomodoroState;
    let newTimeRemaining: number;
    let newTotalTime: number;
    let pomodorosCompleted = currentStatus.pomodorosCompleted;
    let currentCycle = currentStatus.currentCycle;

    // Determinar el siguiente estado basado en el estado actual
    if (currentStatus.state === PomodoroState.WORK) {
      // Incrementar pomodoros completados
      pomodorosCompleted++;
      
      // Determinar si es momento de un descanso largo o corto
      if (pomodorosCompleted % this._settings.longBreakInterval === 0) {
        newState = PomodoroState.LONG_BREAK;
        newTimeRemaining = this._settings.longBreakDuration;
        newTotalTime = this._settings.longBreakDuration;
      } else {
        newState = PomodoroState.SHORT_BREAK;
        newTimeRemaining = this._settings.shortBreakDuration;
        newTotalTime = this._settings.shortBreakDuration;
      }
    } else {
      // Después de un descanso, volver a WORK
      newState = PomodoroState.WORK;
      newTimeRemaining = this._settings.workDuration;
      newTotalTime = this._settings.workDuration;
      
      // Incrementar el ciclo solo después de un descanso
      currentCycle = (currentStatus.state === PomodoroState.LONG_BREAK) ? 1 : currentCycle + 1;
    }

    // Reproducir sonido de notificación
    this.playNotificationSound();

    // Actualizar el estado
    this._status.next({
      state: newState,
      timeRemaining: newTimeRemaining,
      totalTime: newTotalTime,
      pomodorosCompleted,
      currentCycle
    });

    // Iniciar automáticamente el siguiente temporizador
    this.startTimer();
  }

  // Reproducir un sonido de notificación
  private playNotificationSound(): void {
    // Implementación básica con la API Web Audio
    try {
      const audio = new Audio('/assets/sounds/notification.mp3');
      audio.play().catch(error => console.warn('Error playing notification sound:', error));
    } catch (error) {
      console.warn('Error creating audio element:', error);
    }
  }
}