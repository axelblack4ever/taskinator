// src/app/methodologies/methodologies.page.ts
// versión 1.1.0 - 2025-04-04
import { Component, OnInit } from '@angular/core';
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
  IonIcon,
  IonLabel,
  IonRouterLink
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  timerOutline, 
  listOutline, 
  gridOutline, 
  warningOutline, 
  calendarOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-methodologies',
  templateUrl: './methodologies.page.html',
  styleUrls: ['./methodologies.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterLink,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
  ]
})
export class MethodologiesPage implements OnInit {

  constructor() {
    // Registrar los iconos necesarios
    addIcons({
      timerOutline,
      listOutline,
      gridOutline,
      warningOutline,
      calendarOutline
    });
  }

  ngOnInit() {
    console.log('MethodologiesPage initialized');
  }

}