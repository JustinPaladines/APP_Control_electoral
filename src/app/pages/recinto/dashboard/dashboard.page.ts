import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonSpinner
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  businessOutline,
  peopleOutline,
  documentTextOutline,
  gridOutline,
  logOutOutline,
  personCircleOutline
} from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';
import { Recinto } from '../../../core/data/recintos.repository';
import { RecintosService } from '../../../core/services/recintos.service';
@Component({
  selector: 'app-dashboard-recinto',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonSpinner
  ]
})
export class DashboardRecintoPage implements OnInit {

  private readonly router = inject(Router);
  private readonly recintosService = inject(RecintosService);

  readonly authService = inject(AuthService);

  readonly recinto = signal<Recinto | null>(null);
  readonly cargando = signal(false);
  readonly error = signal('');

  constructor() {
    addIcons({
      businessOutline,
      peopleOutline,
      documentTextOutline,
      gridOutline,
      logOutOutline,
      personCircleOutline
    });
  }

  async ngOnInit(): Promise<void> {
    await this.cargarRecinto();
  }

  async cargarRecinto(): Promise<void> {

    this.cargando.set(true);
    this.error.set('');

    try {
      const id = this.authService.perfil()?.recinto_id;

      if (!id) {
        this.error.set('No tiene un recinto asignado.');
        return;
      }

      const recinto = await this.recintosService.obtenerRecinto(id);

      this.recinto.set(recinto);

    } catch (error) {
      console.error(error);
      this.error.set('No se pudo cargar el recinto asignado.');

    } finally {
      this.cargando.set(false);
    }
  }

  async cerrarSesion(): Promise<void> {
    await this.authService.cerrarSesion();
    this.router.navigateByUrl('/login', {
      replaceUrl: true
    });
  }
}