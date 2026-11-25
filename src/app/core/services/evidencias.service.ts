import { Injectable, inject, signal } from '@angular/core';

import {
  Camera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';

import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

import { EvidenciasRepository } from '../data/evidencias.repository';
import { Acta } from '../models/acta.model';

@Injectable({
  providedIn: 'root'
})
export class EvidenciasService {

  private readonly repository = inject(EvidenciasRepository);

  private archivo: Blob | null = null;
  private rutaFoto: string | null = null;

  private readonly _acta = signal<Acta | null>(null);
  private readonly _foto = signal('');
  private readonly _fotoAceptada = signal(false);

  private readonly _latitud = signal<number | null>(null);
  private readonly _longitud = signal<number | null>(null);
  private readonly _precision = signal<number | null>(null);

  private readonly _cargando = signal(false);
  private readonly _error = signal('');
  private readonly _exito = signal('');

  readonly acta = this._acta.asReadonly();
  readonly foto = this._foto.asReadonly();
  readonly fotoAceptada = this._fotoAceptada.asReadonly();

  readonly latitud = this._latitud.asReadonly();
  readonly longitud = this._longitud.asReadonly();
  readonly precision = this._precision.asReadonly();

  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();
  readonly exito = this._exito.asReadonly();

  private async ejecutar(
    operacion: () => Promise<void>,
    mensaje = ''
  ): Promise<boolean> {

    if (this._cargando()) {
      return false;
    }

    this._cargando.set(true);
    this._error.set('');
    this._exito.set('');

    try {

      await operacion();

      this._exito.set(mensaje);

      return true;

    } catch (error) {

      console.error(error);

      const detalle = error as { message?: string };

      this._error.set(
        detalle.message ?? 'No se pudo completar la operación.'
      );

      return false;

    } finally {

      this._cargando.set(false);
    }
  }

  // Limpiar las evidencias anteriores.
  private limpiarFoto(): void {

    if (this._foto().startsWith('blob:')) {
      URL.revokeObjectURL(this._foto());
    }

    this.archivo = null;
    this.rutaFoto = null;

    this._foto.set('');
    this._fotoAceptada.set(false);
  }

  // Cargar el acta y sus evidencias existentes.
  async cargarActa(actaId: number): Promise<boolean> {

    return this.ejecutar(async () => {

      this.limpiarFoto();

      this._acta.set(null);
      this._latitud.set(null);
      this._longitud.set(null);
      this._precision.set(null);

      const acta = await this.repository.obtenerActa(actaId);

      this._acta.set(acta);

      this._latitud.set(acta.latitud);
      this._longitud.set(acta.longitud);

      if (acta.foto_url) {

        const foto = await this.repository.obtenerFoto(
          acta.foto_url
        );

        this.rutaFoto = acta.foto_url;

        this._foto.set(foto);
        this._fotoAceptada.set(true);
      }
    });
  }

  // Capturar una fotografía mediante la cámara.
  async tomarFoto(): Promise<boolean> {

    return this.ejecutar(async () => {

      const imagen = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        correctOrientation: true,
        saveToGallery: false
      });

      if (!imagen.webPath) {
        throw new Error('No se pudo obtener la fotografía.');
      }

      const respuesta = await fetch(imagen.webPath);

      if (!respuesta.ok) {
        throw new Error('No se pudo leer la fotografía.');
      }

      const archivo = await respuesta.blob();

      this.prepararFoto(archivo);
    });
  }

  // Preparar una fotografía seleccionada desde el navegador.
  async seleccionarFoto(archivo: File): Promise<boolean> {

    return this.ejecutar(async () => {

      this.prepararFoto(archivo);
    });
  }

  private prepararFoto(archivo: Blob): void {

    if (!['image/jpeg', 'image/png'].includes(archivo.type)) {
      throw new Error('La fotografía debe ser JPG o PNG.');
    }

    if (archivo.size === 0) {
      throw new Error('La fotografía está vacía.');
    }

    if (archivo.size > 10 * 1024 * 1024) {
      throw new Error('La fotografía supera los 10 MB.');
    }

    this.limpiarFoto();

    this.archivo = archivo;

    this._foto.set(URL.createObjectURL(archivo));

    this._fotoAceptada.set(false);
  }

  // Confirmar manualmente que la fotografía es legible.
  aceptarFoto(): void {

    if (this._foto()) {
      this._fotoAceptada.set(true);
    }
  }

  rechazarFoto(): void {

    this.limpiarFoto();
  }

  // Obtener las coordenadas GPS.
  async obtenerUbicacion(): Promise<boolean> {

    return this.ejecutar(async () => {

      if (Capacitor.isNativePlatform()) {

        const permisos =
          await Geolocation.requestPermissions();

        if (
          permisos.location !== 'granted' &&
          permisos.coarseLocation !== 'granted'
        ) {
          throw new Error(
            'Debes permitir el acceso a la ubicación.'
          );
        }
      }

      const posicion = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      });

      this._latitud.set(posicion.coords.latitude);
      this._longitud.set(posicion.coords.longitude);
      this._precision.set(posicion.coords.accuracy);

    }, 'Ubicación obtenida correctamente.');
  }

  // Guardar las evidencias y finalizar el acta.
  async finalizarActa(): Promise<boolean> {

    return this.ejecutar(async () => {

      const acta = this._acta();
      const latitud = this._latitud();
      const longitud = this._longitud();

      if (!acta) {
        throw new Error('No existe un acta seleccionada.');
      }

      if (!this._fotoAceptada()) {
        throw new Error('Debes aceptar la fotografía.');
      }

      if (latitud === null || longitud === null) {
        throw new Error('Debes obtener la ubicación GPS.');
      }

      if (this.archivo && !this.rutaFoto) {

        this.rutaFoto = await this.repository.subirFoto(
          acta.id,
          this.archivo
        );
      }

      if (!this.rutaFoto) {
        throw new Error('No existe una fotografía válida.');
      }

      await this.repository.finalizarActa(
        acta.id,
        this.rutaFoto,
        latitud,
        longitud
      );

      const actualizada = await this.repository.obtenerActa(
        acta.id
      );

      this._acta.set(actualizada);

      this.archivo = null;

    }, 'Acta finalizada correctamente.');
  }
}