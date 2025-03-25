// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
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
  albums,
  alertCircle,    // Para "Eat the Frog"
  pricetag,       // Para Etiquetas
  folder,         // Para Categorías
  folderOpen,     // Para categoría Otros
  heart,          // Para Pareja y etiqueta Salud
  cash,           // Para la etiqueta Finanzas
  people,         // Para Hijos, Familia, Amigos y etiqueta Relaciones personales
  school,         // Para la etiqueta Desarrollo personal
  briefcase,      // Para la etiqueta Trabajo
  logOut          // Icono para cerrar sesión
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonHeader, IonToolbar, IonTitle, IonMenuToggle]
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  userName = '';
  private subscriptions: Subscription[] = [];
  
  // MODIFICACION DE CODIGO
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
        { title: 'Eat the Frog', url: '/tabs/methodologies/eat-frog', icon: 'alert-circle' },
      ]
    },
    { 
      title: 'Categorías', 
      icon: 'folder', 
      open: false,
      children: [
        { title: 'Personal', url: '/tabs/categories/personal', icon: 'person' },
        { title: 'Pareja', url: '/tabs/categories/partner', icon: 'heart' },
        { title: 'Hijos', url: '/tabs/categories/children', icon: 'people' },
        { title: 'Familia', url: '/tabs/categories/family', icon: 'people' },
        { title: 'Amigos', url: '/tabs/categories/friends', icon: 'people' },
        { title: 'Otros', url: '/tabs/categories/others', icon: 'folder-open' }
      ]
    },
    { 
      title: 'Etiquetas', 
      icon: 'pricetag', 
      open: false,
      children: [
        { title: 'Salud', url: '/tabs/tags/health', icon: 'heart' },
        { title: 'Finanzas', url: '/tabs/tags/finances', icon: 'cash' },
        { title: 'Relaciones personales', url: '/tabs/tags/relationships', icon: 'people' },
        { title: 'Desarrollo personal', url: '/tabs/tags/personal-growth', icon: 'school' },
        { title: 'Trabajo', url: '/tabs/tags/work', icon: 'briefcase' },
      ]
    },
    { title: 'Configuración', url: '/tabs/settings', icon: 'options', open: false }
  ];
  // MODIFICACION DE CODIGO
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // MODIFICACION DE CODIGO
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
      albums,
      alertCircle,
      pricetag,
      folder,
      folderOpen,
      heart,
      cash,
      people,
      school,
      briefcase,
      logOut
    });
    // MODIFICACION DE CODIGO
  }

  ngOnInit() {
    // Suscribirse al estado de autenticación
    this.subscriptions.push(
      this.authService.isAuthenticated().subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      })
    );

    // Obtener datos del usuario
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        if (user && user.user_metadata) {
          this.userName = user.user_metadata.name || user.email || '';
        } else {
          this.userName = '';
        }
      })
    );
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleSection(p: any) {
    p.open = !p.open;
  }
  
  goToHome() {
    this.router.navigateByUrl('/tabs/today');
  }

  async logout() {
    try {
      await this.authService.signOut();
      this.router.navigateByUrl('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}