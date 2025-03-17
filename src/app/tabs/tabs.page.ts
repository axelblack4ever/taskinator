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
import { 
  today, 
  list, 
  options, 
  barChart, 
  add,
  // Importar también los del AppComponent para asegurarnos que estén disponibles
  person, 
  calendar, 
  timer, 
  grid, 
  nutrition,
  chevronDown,
  chevronUp
} from 'ionicons/icons';

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
    // Registrar todos los iconos necesarios
    addIcons({
      today,
      list,
      options,
      barChart,
      add,
      person, 
      calendar, 
      timer, 
      grid, 
      nutrition,
      chevronDown,
      chevronUp
    });
  }
}