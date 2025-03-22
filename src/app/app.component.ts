// src/app/app.component.ts
import { Component } from '@angular/core';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonHeader, IonToolbar, IonTitle, IonMenuToggle } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  person, 
  options, 
  list, 
  calendar, 
  timer, 
  grid, 
  fastFood, 
  clipboard,
  chevronDown, 
  chevronUp,
  albums
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonHeader, IonToolbar, IonTitle, IonMenuToggle]
})
export class AppComponent {
  public appPages = [
    { title: 'Perfil', url: '/tabs/profile', icon: 'person', open: false },
    { 
      title: 'Metodologías', 
      icon: 'albums', 
      open: false,
      children: [
        { title: 'Pomodoro', url: '/tabs/methodologies/pomodoro', icon: 'timer' },
        { title: '3/3/3', url: '/tabs/methodologies/three-three-three', icon: 'list' },
        { title: 'Eisenhower', url: '/tabs/methodologies/eisenhower', icon: 'grid' },
        { title: 'Eat the Frog', url: '/tabs/methodologies/eat-frog', icon: 'fast-food' },
        // Se ha eliminado la línea de Seinfeld
      ]
    },
    { title: 'Categorías y Etiquetas', url: '/tabs/categories', icon: 'clipboard', open: false },
    { title: 'Configuración', url: '/tabs/settings', icon: 'options', open: false }
  ];
  
  constructor(private router: Router) {
    addIcons({ 
      person, 
      options, 
      list, 
      calendar, 
      timer, 
      grid, 
      fastFood,
      clipboard,
      chevronDown,
      chevronUp,
      albums
    });
  }

  toggleSection(p: any) {
    p.open = !p.open;
  }
  
  goToHome() {
    this.router.navigateByUrl('/tabs/today');
  }
}