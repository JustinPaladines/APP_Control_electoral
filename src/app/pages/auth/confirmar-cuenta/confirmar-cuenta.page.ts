import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonIcon,
  IonSpinner
} from '@ionic/angular';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { addIcons } from 'ionicons';
import { mailOutline } from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-confirmar-cuenta',
  templateUrl: './confirmar-cuenta.page.html',
  styleUrls: ['./confirmar-cuenta.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonIcon,
    IonSpinner,
    ReactiveFormsModule
  ]
})
export class ConfirmarCuentaPage {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly cargando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');

  formulario = this.fb.nonNullable.group({
    correo: ['', [
      Validators.required,
      Validators.email
    ]],
    codigo: ['', [
      Validators.required,
      Validators.pattern(/^\d{6,10}$/)
    ]]
  });

  constructor() {
    addIcons({ mailOutline });
  }

  async confirmar(): Promise<void> {

    if (this.formulario.invalid || this.cargando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.exito.set('');

    try {
      const { correo, codigo } = this.formulario.getRawValue();

      await this.authService.confirmarCuenta(correo, codigo);

      this.exito.set('Cuenta confirmada correctamente.');

    } catch (error) {
      console.error(error);
      this.error.set('El código es incorrecto o ha expirado.');

    } finally {
      this.cargando.set(false);
    }
  }

  async reenviar(): Promise<void> {

    if (
      this.formulario.controls.correo.invalid ||
      this.cargando()
    ) {
      this.formulario.controls.correo.markAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.exito.set('');

    try {
      await this.authService.reenviarCodigoConfirmacion(
        this.formulario.controls.correo.value
      );

      this.exito.set(
        'Si la cuenta está pendiente de confirmación, recibirá un código.'
      );

    } catch (error) {
      console.error(error);
      this.error.set('No se pudo reenviar el código. Intenta más tarde.');

    } finally {
      this.cargando.set(false);
    }
  }

  regresar(): void {
    this.router.navigateByUrl('/login', {
      replaceUrl: true
    });
  }
}