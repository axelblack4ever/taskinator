// src/app/tabs/tabs.page.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { 
  IonTabs, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { todayOutline, listOutline, optionsOutline, barChartOutline, add } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonTabs, 
    IonTabBar, 
    IonTabButton, 
    IonIcon, 
    IonLabel,
    IonFab,
    IonFabButton
  ]
})
export class TabsPage {
  constructor() {
    addIcons({
      todayOutline,
      listOutline,
      optionsOutline,
      barChartOutline,
      add
    });
  }
}