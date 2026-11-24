import { Component, inject, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonLabel,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonCard,
  IonCardContent
} from '@ionic/angular';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  personAddOutline,
  personOutline,
  businessOutline,
  mailOutline,
  callOutline,
  closeOutline
} from 'ionicons/icons';

import { UsuariosService } from '../../../core/services/usuarios.service';
import { RecintosService } from '../../../core/services/recintos.service';

import { cedulaEcuatorianaValidator } from '../../../core/validators/cedula-ecuatoriana.validator';

@Component({
  selector: 'app-coordinadores',
  templateUrl: './coordinadores.page.html',
  styleUrls: ['./coordinadores.page.scss'],
  standalone: true,
 imports: [
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonLabel,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonCard,
  IonCardContent,
  ReactiveFormsModule
]
})
export class CoordinadoresPage implements OnInit {

  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly usuariosService = inject(UsuariosService);
  readonly recintosService = inject(RecintosService);

  mostrarFormulario = false;

  // Recintos que todavía no tienen un coordinador asignado
  readonly recintosDisponibles = computed(() =>
    this.recintosService.recintos().filter(recinto =>
      !this.usuariosService.coordinadores().some(
        coordinador => coordinador.recinto_id === recinto.id
      )
    )
  );

  formulario = this.fb.nonNullable.group({
    cedula: ['', [
      Validators.required,
      cedulaEcuatorianaValidator
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
    ]],
    recinto_id: [0, [
      Validators.required,
      Validators.min(1)
    ]]
  });

  constructor() {
    addIcons({
      arrowBackOutline,
      personAddOutline,
      personOutline,
      businessOutline,
      mailOutline,
      callOutline,
      closeOutline
    });
  }

  async ngOnInit(): Promise<void> {
    await this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    await Promise.all([
      this.usuariosService.cargarCoordinadores(),
      this.recintosService.cargarRecintos()
    ]);
  }

  regresar(): void {
    this.router.navigateByUrl('/provincial');
  }

  abrirFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  obtenerNombreRecinto(id: number | null): string {
    const recinto = this.recintosService.recintos().find(
      item => item.id === id
    );

    return recinto?.nombre ?? 'Sin recinto asignado';
  }

  async guardarCoordinador(): Promise<void> {

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();

    const correcto = await this.usuariosService.crearUsuario({
      cedula: valores.cedula.trim(),
      nombres: valores.nombres.trim(),
      apellidos: valores.apellidos.trim(),
      telefono: valores.telefono.trim(),
      correo: valores.correo.trim().toLowerCase(),
      recinto_id: Number(valores.recinto_id),
      rol: 'recinto'
    });

    if (correcto) {
      this.formulario.reset();
      this.mostrarFormulario = false;
    }
  }
}