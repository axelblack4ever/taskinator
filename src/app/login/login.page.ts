// src/app/login/login.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonSpinner,
  IonNote,
  ToastController
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSpinner,
    IonNote,
  ]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  resetPasswordForm: FormGroup;
  isLoading = false;
  currentMode: 'login' | 'register' | 'reset' = 'login';
  redirectUrl: string = '/tabs/today';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPasswords });

    this.resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    // Obtener la URL de redirección si existe
    this.route.queryParams.subscribe(params => {
      if (params['redirectUrl']) {
        this.redirectUrl = params['redirectUrl'];
      }
    });

    // Comprobar si el usuario ya está autenticado
    this.authService.isAuthenticated().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigateByUrl(this.redirectUrl);
      }
    });
  }

  // Validador personalizado para comprobar que las contraseñas coinciden
  checkPasswords(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notSame: true };
  }

  async login() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    try {
      const { session, error } = await this.authService.signIn(email, password);
      
      if (error) {
        throw error;
      }

      if (session) {
        this.router.navigateByUrl(this.redirectUrl);
      }
    } catch (error: any) {
      this.showToast(error.message || 'Error al iniciar sesión');
    } finally {
      this.isLoading = false;
    }
  }

  async register() {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { name, email, password } = this.registerForm.value;

    try {
      const { user, error } = await this.authService.signUp(email, password, name);
      
      if (error) {
        throw error;
      }

      if (user) {
        // Mostrar mensaje de confirmación si se requiere verificación de email
        if (!user.email_confirmed_at) {
          this.showToast('Se ha enviado un email de confirmación a tu correo');
          this.currentMode = 'login';
        } else {
          this.router.navigateByUrl(this.redirectUrl);
        }
      }
    } catch (error: any) {
      this.showToast(error.message || 'Error al registrarse');
    } finally {
      this.isLoading = false;
    }
  }

  async resetPassword() {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { email } = this.resetPasswordForm.value;

    try {
      const { success, error } = await this.authService.resetPassword(email);
      
      if (error) {
        throw error;
      }

      if (success) {
        this.showToast('Se ha enviado un email para restablecer tu contraseña');
        this.currentMode = 'login';
      }
    } catch (error: any) {
      this.showToast(error.message || 'Error al restablecer la contraseña');
    } finally {
      this.isLoading = false;
    }
  }

  switchMode(mode: 'login' | 'register' | 'reset') {
    this.currentMode = mode;
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }
}