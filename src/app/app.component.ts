import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { 
  IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonItem, IonIcon, IonLabel, 
  IonRouterOutlet, IonHeader, IonToolbar, IonTitle, IonMenuToggle,
  IonAccordionGroup, IonAccordion 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  person, 
  options, 
  list, 
  calendar, 
  timer, 
  grid, 
  alertCircle, 
  pricetag,       
  folder,         
  folderOpen,     
  heart,          
  cash,           
  people,         
  school,         
  briefcase,      
  logOut,
  chevronDown,
  chevronUp,
  albums, settings } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    IonApp, 
    IonSplitPane, 
    IonMenu, 
    IonContent, 
    IonList, 
    IonItem, 
    IonIcon, 
    IonLabel, 
    IonRouterOutlet, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonMenuToggle,
    IonAccordionGroup, 
    IonAccordion          
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  userName = '';
  private subscriptions: Subscription[] = [];
  
  chevronDownIcon = 'chevron-down';
  chevronUpIcon = 'chevron-up';
  
  public appPages = [
    { 
      title: 'Perfil',
      url: '/tabs/profile',
      icon: 'person',
      open: false
    },
    {
      title: 'Metodologías',
      icon: 'albums',
      open: false,
      children: [
        { title: 'Pomodoro', url: '/tabs/methodologies/pomodoro', icon: 'timer' },
        { title: '3/3/3', url: '/tabs/methodologies/three-three-three', icon: 'list' },
        { title: 'Eisenhower', url: '/tabs/methodologies/eisenhower', icon: 'grid' },
        { title: 'Eat the Frog', url: '/tabs/methodologies/eat-frog', icon: 'alert-circle' }
      ]
    },
    {
      title: 'Categorías',
      icon: 'folder',
      open: false,
      categories: [
        { title: 'Personal', value: 1, type: 'category', icon: 'person' },
        { title: 'Pareja', value: 2, type: 'category', icon: 'heart' },
        { title: 'Hijos', value: 3, type: 'category', icon: 'people' },
        { title: 'Familia', value: 4, type: 'category', icon: 'people' },
        { title: 'Amigos', value: 5, type: 'category', icon: 'people' },
        { title: 'Otros', value: 6, type: 'category', icon: 'folder-open' }
      ]
    },
    {
      title: 'Etiquetas',
      icon: 'pricetag',
      open: false,
      tags: [
        { title: 'Salud', value: 1, type: 'tag', icon: 'heart' },
        { title: 'Finanzas', value: 2, type: 'tag', icon: 'cash' },
        { title: 'Desarrollo personal', value: 3, type: 'tag', icon: 'school' },
        { title: 'Trabajo', value: 4, type: 'tag', icon: 'briefcase' },
        { title: 'Relaciones personales', value: 5, type: 'tag', icon: 'people' }
      ]
    }
    // Nota: He quitado Configuración de aquí para usar solo el botón fijo.
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    addIcons({person,settings,logOut,options,list,calendar,timer,grid,alertCircle,pricetag,folder,folderOpen,heart,cash,people,school,briefcase,chevronDown,chevronUp,albums});
    
    console.log('Iconos registrados:', 
      {chevronDown: !!chevronDown, chevronUp: !!chevronUp});
  }

  ngOnInit() {
    this.subscriptions.push(
      this.authService.isAuthenticated().subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      })
    );

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
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleSection(p: any) {
    p.open = !p.open;
    this.appPages = [...this.appPages];
  }
  
  goToHome() {
    this.router.navigateByUrl('/tabs/today');
  }

  goToProfile() {
    this.router.navigateByUrl('/profile');
  }

  goToSettings() {
    this.router.navigateByUrl('/tabs/settings');
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
