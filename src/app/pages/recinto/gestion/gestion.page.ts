import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
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
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonSpinner
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  peopleOutline,
  gridOutline,
  personAddOutline,
  addOutline
} from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';
import { ElectoralService } from '../../../core/services/electoral.service';
import { UsuariosService } from '../../../core/services/usuarios.service';

import {
  cedulaEcuatorianaValidator
} from '../../../core/validators/cedula-ecuatoriana.validator';

@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.page.html',
  styleUrls: ['./gestion.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    ReactiveFormsModule
  ]
})
export class GestionPage {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  readonly electoral = inject(ElectoralService);
  readonly usuarios = inject(UsuariosService);

  readonly seccion = signal<'juntas' | 'veedores'>('juntas');

  readonly mostrarRegistro = signal(false);
  readonly mostrarAsignacion = signal(false);

  readonly mensajeRegistro = signal('');
  readonly errorRegistro = signal('');

  readonly ocupado = computed(
    () => this.electoral.cargando() || this.usuarios.cargando()
  );

  formulario = this.fb.nonNullable.group({

    cedula: ['', [
      Validators.required,
      cedulaEcuatorianaValidator()
    ]],

    nombres: ['', [
      Validators.required,
      Validators.pattern(/\S/)
    ]],

    apellidos: ['', [
      Validators.required,
      Validators.pattern(/\S/)
    ]],

    telefono: ['', [
      Validators.required,
      Validators.pattern(/^\d{10}$/)
    ]],

    correo: ['', [
      Validators.required,
      Validators.email
    ]]
  });

  formularioAsignacion = this.fb.nonNullable.group({
    veedor_id: ['', Validators.required],
    jrv_id: [0, [Validators.required, Validators.min(1)]]
  });

  readonly veedorSeleccionado = signal('');

  readonly juntasDisponibles = computed(() => {

    const veedorId = this.veedorSeleccionado();

    return this.electoral.juntas().filter(junta =>
      !this.electoral.asignaciones().some(
        asignacion =>
          asignacion.jrv_id === junta.id &&
          asignacion.veedor_id !== veedorId
      )
    );
  });

  constructor() {

    addIcons({
      arrowBackOutline,
      peopleOutline,
      gridOutline,
      personAddOutline,
      addOutline
    });

    this.formularioAsignacion.controls.veedor_id.valueChanges
      .subscribe(id => this.veedorSeleccionado.set(id));
  }

  async ionViewWillEnter(): Promise<void> {

    const seccion = this.route.snapshot.queryParamMap.get('seccion');

    this.seccion.set(
      seccion === 'veedores' ? 'veedores' : 'juntas'
    );

    await this.electoral.cargarRecinto();
  }

  cambiarSeccion(seccion: 'juntas' | 'veedores'): void {

    this.seccion.set(seccion);
    this.mostrarRegistro.set(false);
    this.mostrarAsignacion.set(false);
  }

  async generarJuntas(): Promise<void> {
    await this.electoral.generarJuntas();
  }

  alternarRegistro(): void {

    this.mensajeRegistro.set('');
    this.errorRegistro.set('');
    this.mostrarAsignacion.set(false);

    this.mostrarRegistro.update(valor => !valor);
  }

  async registrarVeedor(): Promise<void> {

    if (this.formulario.invalid || this.ocupado()) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.errorRegistro.set('');
    this.mensajeRegistro.set('');

    const recintoId = this.authService.perfil()?.recinto_id;

    if (!recintoId) {
      this.errorRegistro.set('No existe un recinto asignado.');
      return;
    }

    const datos = this.formulario.getRawValue();

    const registrado = await this.usuarios.crearUsuario({
      cedula: datos.cedula.trim(),
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      telefono: datos.telefono.trim(),
      correo: datos.correo.trim().toLowerCase(),
      rol: 'veedor',
      recinto_id: recintoId
    });

    if (registrado) {

      this.mensajeRegistro.set(
        this.usuarios.exito() || 'Veedor registrado correctamente.'
      );

      this.formulario.reset();
      this.mostrarRegistro.set(false);

      await this.electoral.cargarRecinto();

    } else {

      this.errorRegistro.set(
        this.usuarios.error() || 'No se pudo registrar el veedor.'
      );
    }
  }

  abrirAsignacion(veedorId = '', jrvId = 0): void {

    this.mostrarRegistro.set(false);

    this.formularioAsignacion.reset({
      veedor_id: veedorId,
      jrv_id: jrvId
    });

    this.mostrarAsignacion.set(true);
  }

  async guardarAsignacion(): Promise<void> {

    if (this.formularioAsignacion.invalid || this.ocupado()) {
      this.formularioAsignacion.markAllAsTouched();
      return;
    }

    const { veedor_id, jrv_id } =
      this.formularioAsignacion.getRawValue();

    const resultado = await this.electoral.asignarVeedor(
      veedor_id,
      Number(jrv_id)
    );

    if (resultado) {
      this.mostrarAsignacion.set(false);
      this.formularioAsignacion.reset();
    }
  }

  async retirarAsignacion(veedorId: string): Promise<void> {

    if (!window.confirm('¿Retirar la asignación de este veedor?')) {
      return;
    }

    await this.electoral.retirarAsignacion(veedorId);
  }

  obtenerVeedor(jrvId: number) {

    const asignacion = this.electoral.asignaciones().find(
      a => a.jrv_id === jrvId
    );

    return this.electoral.veedores().find(
      v => v.id === asignacion?.veedor_id
    );
  }

  obtenerJunta(veedorId: string) {

    const asignacion = this.electoral.asignaciones().find(
      a => a.veedor_id === veedorId
    );

    return this.electoral.juntas().find(
      j => j.id === asignacion?.jrv_id
    );
  }

  regresar(): void {
    this.router.navigateByUrl('/recinto');
  }
}