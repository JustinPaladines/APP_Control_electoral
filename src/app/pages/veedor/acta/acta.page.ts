import { Component, inject, signal, computed } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonSpinner
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  documentTextOutline,
  saveOutline,
  checkmarkCircleOutline,
  alertCircleOutline
} from 'ionicons/icons';

import { ActasService } from '../../../core/services/actas.service';
import { ElectoralService } from '../../../core/services/electoral.service';

import { Dignidad } from '../../../core/models/acta.model';

// Validar números enteros no negativos.
function validarCantidad(control: AbstractControl) {

  const valor = control.value;

  if (
    valor === null ||
    valor === '' ||
    !Number.isInteger(Number(valor)) ||
    Number(valor) < 0
  ) {
    return { cantidadInvalida: true };
  }

  return null;
}

@Component({
  selector: 'app-acta',
  templateUrl: './acta.page.html',
  styleUrls: ['./acta.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonSpinner,
    ReactiveFormsModule
  ]
})
export class ActaPage {

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly actasService = inject(ActasService);
  readonly electoral = inject(ElectoralService);

  readonly dignidad = signal<Dignidad>('alcaldia');

  readonly juntaId = signal(0);
  readonly numeroJunta = signal(0);

  readonly cargando = signal(false);
  readonly formularioListo = signal(false);
  readonly error = signal('');

  readonly totalCalculado = signal(0);
  readonly totalSufragantes = signal(0);
  readonly cantidadesValidas = signal(false);

  readonly titulo = computed(() =>
    this.dignidad() === 'alcaldia'
      ? 'Alcaldía'
      : 'Prefectura'
  );

  readonly diferencia = computed(() =>
    this.totalSufragantes() - this.totalCalculado()
  );

  readonly totalesCorrectos = computed(() =>
    this.cantidadesValidas() && this.diferencia() === 0
  );

  formulario = this.fb.nonNullable.group({

    total_sufragantes: [
      0,
      [Validators.required, validarCantidad]
    ],

    votos_nulos: [
      0,
      [Validators.required, validarCantidad]
    ],

    votos_blancos: [
      0,
      [Validators.required, validarCantidad]
    ],

    votos: this.fb.array(
      Array.from({ length: 5 }, () =>
        this.fb.nonNullable.control(
          0,
          [Validators.required, validarCantidad]
        )
      )
    )
  });

  constructor() {

    addIcons({
      arrowBackOutline,
      documentTextOutline,
      saveOutline,
      checkmarkCircleOutline,
      alertCircleOutline
    });

    this.formulario.valueChanges.subscribe(() => {
      this.calcularTotales();
    });
  }

  async ionViewWillEnter(): Promise<void> {

    await this.cargarFormulario();
  }

  async cargarFormulario(): Promise<void> {

    this.cargando.set(true);
    this.formularioListo.set(false);
    this.error.set('');

    try {

      const dignidad =
        this.route.snapshot.paramMap.get('dignidad');

      if (dignidad !== 'alcaldia' && dignidad !== 'prefectura') {
        throw new Error('Dignidad electoral inválida.');
      }

      this.dignidad.set(dignidad);

      // Consultar la asignación actual del veedor.
      const resultado = await this.electoral.cargarMiJunta();

      if (!resultado) {
        throw new Error('No se pudo consultar la junta.');
      }

      const junta = this.electoral.juntas()[0];

      if (!junta) {
        throw new Error('No tienes una junta asignada.');
      }

      this.juntaId.set(junta.id);
      this.numeroJunta.set(junta.numero);

      const cargado = await this.actasService.cargarFormulario(
        junta.id,
        dignidad
      );

      if (!cargado) {
        throw new Error(this.actasService.error());
      }

      const existente = this.actasService.actaActual();

      const votos = this.actasService.candidaturas().map(
        candidatura =>
          existente?.resultados.find(
            r => r.candidatura_id === candidatura.id
          )?.cantidad_votos ?? 0
      );

      this.formulario.reset({

        total_sufragantes:
          existente?.acta.total_sufragantes ?? 0,

        votos_nulos:
          existente?.acta.votos_nulos ?? 0,

        votos_blancos:
          existente?.acta.votos_blancos ?? 0,

        votos
      });

      this.calcularTotales();
      this.formularioListo.set(true);

    } catch (error) {

      console.error(error);

      const detalle = error as { message?: string };

      this.error.set(
        detalle.message ?? 'No se pudo cargar el formulario.'
      );

    } finally {

      this.cargando.set(false);
    }
  }

  // Calcular la suma de todos los votos.
  calcularTotales(): void {

    const datos = this.formulario.getRawValue();

    const totalCandidatos = datos.votos.reduce(
      (total, votos) => total + (Number(votos) || 0),
      0
    );

    const total =
      totalCandidatos +
      (Number(datos.votos_nulos) || 0) +
      (Number(datos.votos_blancos) || 0);

    this.totalCalculado.set(total);

    this.totalSufragantes.set(
      Number(datos.total_sufragantes) || 0
    );

    this.cantidadesValidas.set(this.formulario.valid);
  }

  // Guardar o actualizar el acta.
  async guardarActa(): Promise<void> {

    if (
      !this.formularioListo() ||
      this.formulario.invalid ||
      !this.totalesCorrectos() ||
      this.actasService.cargando()
    ) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();

    const resultados = this.actasService.candidaturas().map(
      (candidatura, indice) => ({
        candidatura_id: candidatura.id,
        cantidad_votos: Number(datos.votos[indice])
      })
    );

    const guardado = await this.actasService.guardarActa({

      jrv_id: this.juntaId(),
      dignidad: this.dignidad(),

      total_sufragantes: Number(datos.total_sufragantes),
      votos_nulos: Number(datos.votos_nulos),
      votos_blancos: Number(datos.votos_blancos),

      resultados
    });

    // Marcar el formulario como guardado correctamente.
    if (
      guardado &&
      JSON.stringify(this.formulario.getRawValue()) ===
      JSON.stringify(datos)
    ) {
      this.formulario.markAsPristine();
    }
  }

  // Abrir la página de fotografía y ubicación GPS.
  abrirEvidencias(): void {

    const acta = this.actasService.actaActual()?.acta;

    if (
      !acta ||
      this.formulario.dirty ||
      this.actasService.cargando()
    ) {
      return;
    }

    this.router.navigate([
      '/veedor/evidencias',
      acta.id
    ]);
  }

  // Regresar al panel del veedor.
  regresar(): void {

    this.router.navigateByUrl('/veedor');
  }
}