
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  ToastController
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  businessOutline,
  peopleOutline,
  documentTextOutline,
  barChartOutline,
  logOutOutline,
  locationOutline
} from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-provincial',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle
  ]
})
export class DashboardProvincialPage {

  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  readonly authService = inject(AuthService);

  constructor() {
    addIcons({
      businessOutline,
      peopleOutline,
      documentTextOutline,
      barChartOutline,
      logOutOutline,
      locationOutline
    });
  }

  get nombreUsuario(): string {
    const perfil = this.authService.perfil();

    return perfil
      ? `${perfil.nombres} ${perfil.apellidos}`
      : 'Coordinador provincial';
  }

  irARecintos(): void {
    this.router.navigateByUrl('/provincial/recintos');
  }

  async mostrarProximamente(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'Este módulo se implementará próximamente.',
      duration: 2000,
      position: 'bottom',
      color: 'primary'
    });

    await toast.present();
  }

  irCoordinadores(): void {
    this.router.navigateByUrl('/provincial/coordinadores');
  }

  async cerrarSesion(): Promise<void> {
    try {
      await this.authService.cerrarSesion();

      await this.router.navigateByUrl('/login', {
        replaceUrl: true
      });

    } catch (error) {
      const toast = await this.toastController.create({
        message: 'No se pudo cerrar la sesión.',
        duration: 3000,
        color: 'danger'
      });

      await toast.present();
    }
  }
}
