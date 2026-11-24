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
import { ActasService } from '../../../core/services/actas.service';

import { Recinto } from '../../../core/data/recintos.repository';
import { Dignidad } from '../../../core/models/acta.model';

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
  readonly actasService = inject(ActasService);

  readonly recinto = signal<Recinto | null>(null);
  readonly cargando = signal(false);
  readonly error = signal('');

  readonly junta = computed(
    () => this.electoral.juntas()[0] ?? null
  );

  readonly dignidades: {
  valor: Dignidad;
  nombre: string;
  descripcion: string;
}[] = [
  {
    valor: 'alcaldia',
    nombre: 'Alcaldía',
    descripcion: 'Resultados electorales para alcalde.'
  },
  {
    valor: 'prefectura',
    nombre: 'Prefectura',
    descripcion: 'Resultados electorales para prefecto.'
  }
];

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

      const actasCargadas = await this.actasService.cargarActas();

      if (!actasCargadas) {
        throw new Error(this.actasService.error());
      }

    } catch (error) {

      console.error(error);

      this.error.set(
        'No se pudo consultar la información electoral.'
      );

    } finally {

      this.cargando.set(false);
    }
  }

  obtenerActa(dignidad: Dignidad) {

    return this.actasService.actas().find(
      acta =>
        acta.dignidad === dignidad &&
        acta.jrv_id === this.junta()?.id
    );
  }

  abrirActa(dignidad: Dignidad): void {

    if (!this.junta()) {
      return;
    }

    this.router.navigate([
      '/veedor/acta',
      dignidad
    ]);
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