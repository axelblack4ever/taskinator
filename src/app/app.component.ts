import { Component, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';
import { DatabaseService } from './services/database.service';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonHeader, IonToolbar, IonTitle, IonMenuToggle } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { personOutline, optionsOutline, listOutline, calendarOutline, timerOutline, gridOutline, nutritionOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonHeader, IonToolbar, IonTitle, IonMenuToggle]
})
export class AppComponent implements OnDestroy {
  public appPages = [
    { title: 'Perfil', url: '/tabs/profile', icon: 'personOutline', open: false },
    { 
      title: 'Metodologías', 
      icon: 'optionsOutline', 
      open: false,
      children: [
        { title: 'Pomodoro', url: '/tabs/methodologies/pomodoro', icon: 'timerOutline' },
        { title: '3/3/3', url: '/tabs/methodologies/three-three-three', icon: 'listOutline' },
        { title: 'Eisenhower', url: '/tabs/methodologies/eisenhower', icon: 'gridOutline' },
        { title: 'Eat the Frog', url: '/tabs/methodologies/eat-frog', icon: 'nutritionOutline' },
        { title: 'Seinfeld', url: '/tabs/methodologies/seinfeld', icon: 'calendarOutline' },
      ]
    },
    { title: 'Categorías y Etiquetas', url: '/tabs/categories', icon: 'listOutline', open: false },
    { title: 'Configuración', url: '/tabs/settings', icon: 'optionsOutline', open: false }
  ];
  
  constructor(private router: Router,
    private platform: Platform,
    private dbService: DatabaseService) {
    addIcons({ 
      personOutline, 
      optionsOutline, 
      listOutline, 
      calendarOutline, 
      timerOutline, 
      gridOutline, 
      nutritionOutline,
      chevronDownOutline,
      chevronUpOutline
    });

        // Manejar el evento de pausa/cierre de la aplicación
        this.platform.pause.subscribe(() => {
          console.log('Application paused');
          this.persistData();
        });
        
        this.platform.resume.subscribe(() => {
          console.log('Application resumed');
        });    
  }

  goToHome() {
    this.router.navigateByUrl('/tabs/today');
}

  toggleSection(p: any) {
    p.open = !p.open;
  }

  async persistData() {
    try {
      // No cerramos la conexión, solo aseguramos que se guarde todo
      console.log('Ensuring data is persisted');
    } catch (error) {
      console.error('Error persisting data', error);
    }
  }
  
  ngOnDestroy() {
    // Cerrar la conexión cuando el componente se destruye
    this.dbService.closeConnection();
  }  
  
}