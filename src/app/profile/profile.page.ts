// src/app/profile/profile.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  ToastController,
  IonList
} from '@ionic/angular/standalone';
import { AuthService, AuthUser } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonList
  ]
})
export class ProfilePage implements OnInit, OnDestroy {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  currentUser: AuthUser | null = null;
  isLoading = false;
  isUpdatingPassword = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastController: ToastController
  ) {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }]
    });

    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPasswords });
  }

  ngOnInit() {
    // Obtener información del usuario actual
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.profileForm.patchValue({
            name: user.user_metadata?.name || '',
            email: user.email || ''
          });
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Validador personalizado para comprobar que las contraseñas coinciden
  checkPasswords(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notSame: true };
  }

  async updateProfile() {
    if (this.profileForm.invalid) {
      return;
    }

    this.isLoading = true;
    try {
      const { name } = this.profileForm.value;
      const { success, error } = await this.authService.updateProfile({ name });

      if (error) {
        throw error;
      }

      if (success) {
        this.showToast('Perfil actualizado correctamente');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      this.showToast('Error al actualizar el perfil: ' + (error.message || 'Ocurrió un error desconocido'));
    } finally {
      this.isLoading = false;
    }
  }

  async updatePassword() {
    if (this.passwordForm.invalid) {
      return;
    }

    this.isUpdatingPassword = true;
    try {
      const { newPassword } = this.passwordForm.value;
      const { success, error } = await this.authService.updatePassword(newPassword);

      if (error) {
        throw error;
      }

      if (success) {
        this.showToast('Contraseña actualizada correctamente');
        this.passwordForm.reset();
      }
    } catch (error: any) {
      console.error('Error updating password:', error);
      this.showToast('Error al actualizar la contraseña: ' + (error.message || 'Ocurrió un error desconocido'));
    } finally {
      this.isUpdatingPassword = false;
    }
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