import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonInput,
  IonItem,
  IonLabel
} from '@ionic/angular';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  addOutline,
  locationOutline,
  businessOutline
} from 'ionicons/icons';

import { RecintosService } from '../../../core/services/recintos.service';

@Component({
  selector: 'app-recintos',
  templateUrl: './recintos.page.html',
  styleUrls: ['./recintos.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonSpinner,
    IonInput,
    IonItem,
    IonLabel,
    ReactiveFormsModule
  ]
})
export class RecintosPage implements OnInit {

  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly recintosService = inject(RecintosService);

  mostrarFormulario = false;

  formulario = this.fb.nonNullable.group({
    nombre: ['', [
      Validators.required,
      Validators.pattern(/\S/)
    ]],
    parroquia: ['', [
      Validators.required,
      Validators.pattern(/\S/)
    ]],
    cantidad_jrv: [1, [
      Validators.required,
      Validators.min(1),
      Validators.pattern(/^[1-9]\d*$/)
    ]]
  });

  constructor() {
    addIcons({
      arrowBackOutline,
      addOutline,
      locationOutline,
      businessOutline
    });
  }

  ngOnInit(): void {
    this.recintosService.cargarRecintos();
  }

  regresar(): void {
    this.router.navigateByUrl('/provincial');
  }

  crearRecinto(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  async guardarRecinto(): Promise<void> {

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();

    const correcto = await this.recintosService.crearRecinto({
      nombre: valores.nombre.trim(),
      parroquia: valores.parroquia.trim(),
      cantidad_jrv: Number(valores.cantidad_jrv),
      canton: 'Quito',
      provincia: 'Pichincha'
    });

    if (correcto) {
      this.formulario.reset({
        nombre: '',
        parroquia: '',
        cantidad_jrv: 1
      });

      this.mostrarFormulario = false;
    }
  }
}