import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonListHeader
} from '@ionic/angular/standalone';

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
    IonItem,
    IonLabel,
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonListHeader,
    CommonModule,
    FormsModule
  ]
})
export class SettingsPage implements OnInit {

  // Propiedades para la configuración de la aplicación
  idioma = 'es';
  sonidosActivados = false;
  sonidoAlCompletar = 'campanilla';
  notificacionesActivadas = false;
  vibracionActivada = false;
  tema = 'claro';
  comportamientoMetodos = 'lista';  

  constructor() { }

  ngOnInit() {
  }

}
