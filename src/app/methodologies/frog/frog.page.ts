import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonAlert,
  IonModal,
  IonPopover,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { informationCircle, refreshOutline, checkmark } from 'ionicons/icons';
import { TaskService } from '../../services/task.service';
import { TaskDetailResponse } from '../../models/task.model';

@Component({
  selector: 'app-eat-the-frog',
  templateUrl: './frog.page.html',
  styleUrls: ['./frog.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonAlert,
    IonModal,
    IonPopover
  ]
})
export class EatTheFrogPage implements OnInit {
  frogTasks: TaskDetailResponse[] = [];
  currentFrog: TaskDetailResponse | null = null;
  rotationsLeft = 3;

  constructor(
    private taskService: TaskService,
    private modalController: ModalController
  ) {
    addIcons({ informationCircle, refreshOutline, checkmark });
  }

  ngOnInit() {
    this.loadFrogTasks();
  }

  async loadFrogTasks() {
    try {
      this.rotationsLeft = 3;
      this.frogTasks = await this.taskService.getFrogTasks();
      this.currentFrog = this.frogTasks[0] || null;
    } catch (error) {
      console.error('Error loading frog tasks', error);
    }
  }

  async completeCurrentFrog() {
    if (!this.currentFrog) { return; }
    try {
      await this.taskService.toggleTaskCompletion(this.currentFrog.id!, true);
      await this.showNextFrogModal();
    } catch (error) {
      console.error('Error completing frog task', error);
    }
  }

  async rotateFrog() {
    if (this.rotationsLeft <= 0 || this.frogTasks.length <= 1) { return; }
    this.rotationsLeft--;
    this.frogTasks.push(this.frogTasks.shift()!);
    this.currentFrog = this.frogTasks[0] || null;
  }

  async showNextFrogModal() {
    const modal = await this.modalController.create({
      component: IonAlert,
      componentProps: {
        header: '¿Quieres comerte otra rana?',
        buttons: [
          {
            text: 'No',
            role: 'cancel'
          },
          {
            text: 'Sí',
            role: 'confirm'
          }
        ]
      }
    });
    await modal.present();
    const { role } = await modal.onDidDismiss();

    if (role === 'confirm') {
      await this.loadFrogTasks();
    } else {
      const congratsModal = await this.modalController.create({
        component: IonAlert,
        componentProps: {
          header: '¡Enhorabuena por comerte tu rana del día! 🐸',
          buttons: ['Ok']
        }
      });
      await congratsModal.present();
    }
  }
}