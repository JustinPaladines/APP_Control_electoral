import { Component, inject, computed, signal } from '@angular/core';

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
  arrowBackOutline,
  documentTextOutline,
  createOutline,
  cameraOutline,
  locationOutline,
  refreshOutline
} from 'ionicons/icons';

import { ActasService } from '../../../core/services/actas.service';
import { ElectoralService } from '../../../core/services/electoral.service';

import { Acta } from '../../../core/models/acta.model';

@Component({
  selector: 'app-actas',
  templateUrl: './actas.page.html',
  styleUrls: ['./actas.page.scss'],
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
export class ActasPage {

  private readonly router = inject(Router);

  readonly actasService = inject(ActasService);
  readonly electoral = inject(ElectoralService);

  readonly cargando = signal(false);
  readonly error = signal('');

  readonly filtro = signal('todas');

  readonly totalActas = computed(() =>
    this.actasService.actas().length
  );

  readonly totalRegistradas = computed(() =>
    this.actasService.actas().filter(
      acta => acta.estado === 'registrada'
    ).length
  );

  readonly totalCorregidas = computed(() =>
    this.actasService.actas().filter(
      acta => acta.estado === 'corregida'
    ).length
  );

  readonly totalBorradores = computed(() =>
    this.actasService.actas().filter(
      acta => acta.estado === 'borrador'
    ).length
  );

  readonly actasFiltradas = computed(() => {

    const actas = this.actasService.actas();

    if (this.filtro() === 'todas') {
      return actas;
    }

    return actas.filter(
      acta => acta.dignidad === this.filtro()
    );
  });

  constructor() {

    addIcons({
      arrowBackOutline,
      documentTextOutline,
      createOutline,
      cameraOutline,
      locationOutline,
      refreshOutline
    });
  }

  async ionViewWillEnter(): Promise<void> {

    await this.cargarDatos();
  }

  // Consultar las juntas y actas del recinto.
  async cargarDatos(): Promise<void> {

    this.cargando.set(true);
    this.error.set('');

    try {

      const juntas = await this.electoral.cargarRecinto();

      if (!juntas) {
        throw new Error(this.electoral.error());
      }

      const actas = await this.actasService.cargarActas();

      if (!actas) {
        throw new Error(this.actasService.error());
      }

    } catch (error) {

      const detalle = error as { message?: string };

      this.error.set(
        detalle.message ?? 'No se pudieron consultar las actas.'
      );

    } finally {

      this.cargando.set(false);
    }
  }

  cambiarFiltro(filtro: string): void {

    this.filtro.set(filtro);
  }

  obtenerNumeroJunta(jrvId: number): number | string {

    return this.electoral.juntas().find(
      junta => junta.id === jrvId
    )?.numero ?? 'Sin información';
  }

  obtenerDignidad(acta: Acta): string {

    return acta.dignidad === 'alcaldia'
      ? 'Alcaldía'
      : 'Prefectura';
  }

  corregirActa(acta: Acta): void {

    this.router.navigate([
      '/recinto/acta',
      acta.jrv_id,
      acta.dignidad
    ]);
  }

  abrirEvidencias(acta: Acta): void {

    this.router.navigate([
      '/recinto/evidencias',
      acta.id
    ]);
  }

  regresar(): void {

    this.router.navigateByUrl('/recinto');
  }
}