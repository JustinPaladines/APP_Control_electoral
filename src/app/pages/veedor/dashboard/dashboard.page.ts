import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  logOutOutline,
  locationOutline,
  gridOutline,
  documentTextOutline,
  refreshOutline
} from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';
import { ElectoralService } from '../../../core/services/electoral.service';
import { RecintosService } from '../../../core/services/recintos.service';
import { Recinto } from '../../../core/data/recintos.repository';

@Component({
  selector: 'app-dashboard-veedor',
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
    IonSpinner
  ]
})
export class DashboardVeedorPage {

  private readonly router = inject(Router);
  private readonly recintosService = inject(RecintosService);

  readonly authService = inject(AuthService);
  readonly electoral = inject(ElectoralService);

  readonly recinto = signal<Recinto | null>(null);
  readonly cargando = signal(false);
  readonly error = signal('');

  readonly junta = computed(
    () => this.electoral.juntas()[0] ?? null
  );

  constructor() {

    addIcons({
      logOutOutline,
      locationOutline,
      gridOutline,
      documentTextOutline,
      refreshOutline
    });
  }

  async ionViewWillEnter(): Promise<void> {
    await this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {

    if (this.cargando()) {
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.recinto.set(null);

    try {

      const recintoId = this.authService.perfil()?.recinto_id;

      if (!recintoId) {
        throw new Error('No existe un recinto asignado.');
      }

      const recinto =
        await this.recintosService.obtenerRecinto(recintoId);

      this.recinto.set(recinto);

      const resultado = await this.electoral.cargarMiJunta();

      if (!resultado) {
        throw new Error(this.electoral.error());
      }

    } catch (error) {

      console.error(error);
      this.error.set('No se pudo consultar la asignación.');

    } finally {
      this.cargando.set(false);
    }
  }

  async cerrarSesion(): Promise<void> {

    try {

      await this.authService.cerrarSesion();

      this.router.navigateByUrl('/login', {
        replaceUrl: true
      });

    } catch (error) {

      console.error(error);
      this.error.set('No se pudo cerrar la sesión.');
    }
  }
}