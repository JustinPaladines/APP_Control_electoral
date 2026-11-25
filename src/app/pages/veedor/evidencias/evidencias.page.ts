import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Capacitor } from '@capacitor/core';

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
import { AuthService } from '../../../core/services/auth.service';

import {
  arrowBackOutline,
  cameraOutline,
  locationOutline,
  checkmarkCircleOutline,
  imageOutline,
  refreshOutline
} from 'ionicons/icons';

import { EvidenciasService } from '../../../core/services/evidencias.service';

@Component({
  selector: 'app-evidencias',
  templateUrl: './evidencias.page.html',
  styleUrls: ['./evidencias.page.scss'],
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
export class EvidenciasPage {

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly evidencias = inject(EvidenciasService);

  readonly plataformaNativa =
    Capacitor.isNativePlatform();

  readonly titulo = computed(() =>
    this.evidencias.acta()?.dignidad === 'alcaldia'
      ? 'Alcaldía'
      : 'Prefectura'
  );

  private readonly authService = inject(AuthService);

  readonly esCoordinador = computed(() =>
    this.authService.perfil()?.rol === 'recinto'
  );

  readonly puedeFinalizar = computed(() =>
    this.evidencias.acta() !== null &&
    this.evidencias.fotoAceptada() &&
    this.evidencias.latitud() !== null &&
    this.evidencias.longitud() !== null &&
    !this.evidencias.cargando()
  );

  constructor() {

    addIcons({
      arrowBackOutline,
      cameraOutline,
      locationOutline,
      checkmarkCircleOutline,
      imageOutline,
      refreshOutline
    });
  }

  async ionViewWillEnter(): Promise<void> {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!Number.isSafeInteger(id) || id <= 0) {

      this.regresar();

      return;
    }

    await this.evidencias.cargarActa(id);
  }

  async tomarFoto(): Promise<void> {

    await this.evidencias.tomarFoto();
  }

  async seleccionarFoto(evento: Event): Promise<void> {

    const input = evento.target as HTMLInputElement;

    const archivo = input.files?.[0];

    if (archivo) {

      await this.evidencias.seleccionarFoto(archivo);
    }

    input.value = '';
  }

  aceptarFoto(): void {

    this.evidencias.aceptarFoto();
  }

  rechazarFoto(): void {

    this.evidencias.rechazarFoto();
  }

  async obtenerUbicacion(): Promise<void> {

    await this.evidencias.obtenerUbicacion();
  }

  async finalizarActa(): Promise<void> {

    if (!this.puedeFinalizar()) {
      return;
    }

    const confirmacion = window.confirm(
      '¿Confirmas que la fotografía es legible y deseas guardar el acta?'
    );

    if (!confirmacion) {
      return;
    }

    const resultado =
      await this.evidencias.finalizarActa();

    if (resultado) {

      window.alert('Acta finalizada correctamente.');

      this.regresar();
    }
  }

  regresar(): void {

  const ruta = this.esCoordinador()
    ? '/recinto/actas'
    : '/veedor';

  this.router.navigateByUrl(ruta);
}
}