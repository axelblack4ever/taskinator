// src/app/methodologies/pomodoro/components/pomodoro-progress/pomodoro-progress.component.ts
// versión 1.0.0 - 2025-04-04
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { PomodoroService, PomodoroState } from 'src/app/services/pomodoro.service';

@Component({
  selector: 'app-pomodoro-progress',
  templateUrl: './pomodoro-progress.component.html',
  styleUrls: ['./pomodoro-progress.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardContent
  ]
})
export class PomodoroProgressComponent implements OnInit, OnDestroy {
  // Estado actual del temporizador
  pomodorosCompleted: number = 0;
  currentState: PomodoroState = PomodoroState.IDLE;
  
  // Patrón de pomodoros (corto, corto, corto, largo)
  pomodoros = [
    { label: 'Corto', completed: false, active: false },
    { label: 'Corto', completed: false, active: false },
    { label: 'Corto', completed: false, active: false },
    { label: 'Largo', completed: false, active: false }
  ];
  
  // Para suscripción
  private statusSubscription?: Subscription;
  
  constructor(private pomodoroService: PomodoroService) {}

  ngOnInit() {
    // Suscribirse al estado del pomodoro
    this.statusSubscription = this.pomodoroService.status$.subscribe((status: { pomodorosCompleted: number; state: PomodoroState }) => {
      this.pomodorosCompleted = status.pomodorosCompleted;
      this.currentState = status.state;
      
      this.updateProgressDisplay();
    });
  }

  ngOnDestroy() {
    // Limpieza de suscripciones
    this.statusSubscription?.unsubscribe();
  }
  
  // Actualizar la visualización del progreso
  private updateProgressDisplay(): void {
    // Reset all pomodoros
    this.pomodoros.forEach(p => {
      p.completed = false;
      p.active = false;
    });
    
    // Se marcan como completados los pomodoros según el contador
    // Considerando ciclos completos (cada 4 pomodoros)
    const completedInCurrentCycle = this.pomodorosCompleted % 4;
    
    for (let i = 0; i < completedInCurrentCycle; i++) {
      if (i < 4) { // Aseguramos que no exceda el arreglo
        this.pomodoros[i].completed = true;
      }
    }
    
    // Si estamos en un ciclo de trabajo y ya hemos completado algún pomodoro
    // o estamos en el primer ciclo, marcar el pomodoro actual como activo
    if (this.currentState === PomodoroState.WORK && completedInCurrentCycle < 4) {
      this.pomodoros[completedInCurrentCycle].active = true;
    }
    
    // Si estamos en un descanso corto, el correspondiente pomodoro ya está completado
    // Si estamos en un descanso largo, todos los pomodoros del ciclo están completados
  }
}