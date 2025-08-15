import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonListHeader,
  IonLabel,
  IonItem,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonButton
} from '@ionic/angular/standalone';

import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ToastController } from '@ionic/angular';

import { SettingsService } from 'src/app/services/settings.service';
import { UpdateUserSettingsRequest } from 'src/app/models/user-settings.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonListHeader,
    IonLabel,
    IonItem,
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonButton,
    FormsModule,
    NgIf
  ]
})
export class SettingsPage {
  sonidosActivados = false;
  sonidoAlCompletar = 'campanilla';
  notificacionesActivadas = false;
  vibracionActivada = false;
  tema = 'claro';
  comportamientoMetodos = 'lista';

  constructor(
    private settingsService: SettingsService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.settingsService.settings$.subscribe(settings => {
      if (settings) {
        this.sonidosActivados = settings.sounds_enabled;
        this.sonidoAlCompletar = settings.sound_choice;
        this.notificacionesActivadas = settings.notifications_enabled;
        this.vibracionActivada = settings.vibration_enabled;
        this.tema = settings.theme;
        this.comportamientoMetodos = settings.methods_behavior;
      }
    });
  }

  async guardarConfiguracion() {
    // console.log('[DEBUG] guardarConfiguracion llamada');    
    const actualizacion: UpdateUserSettingsRequest = {
      sounds_enabled: this.sonidosActivados,
      sound_choice: this.sonidoAlCompletar,
      notifications_enabled: this.notificacionesActivadas,
      vibration_enabled: this.vibracionActivada,
      theme: this.tema,
      methods_behavior: this.comportamientoMetodos
    };

    try {
      await this.settingsService.updateSettings(actualizacion);
      const toast = await this.toastCtrl.create({
        message: 'Configuración guardada correctamente.',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Error al guardar la configuración.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }
  // async guardarConfiguracion() {
  //   console.log('[DEBUG] guardarConfiguracion llamada');

  // }

}
