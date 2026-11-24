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
import { lockClosedOutline } from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-restablecer-password',
  templateUrl: './restablecer-password.page.html',
  styleUrls: ['./restablecer-password.page.scss'],
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
export class RestablecerPasswordPage {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly cargando = signal(false);
  readonly error = signal('');
  readonly exito = signal(false);

  formulario = this.fb.nonNullable.group({
    correo: ['', [
      Validators.required,
      Validators.email
    ]],
    codigo: ['', [
      Validators.required,
      Validators.pattern(/^\d{6,10}$/)
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(8)
    ]],
    confirmarPassword: ['', [
      Validators.required
    ]]
  });

  constructor() {

    addIcons({ lockClosedOutline });

    const correo = history.state?.correo;

    if (typeof correo === 'string') {
      this.formulario.controls.correo.setValue(correo);
    }
  }

  async restablecer(): Promise<void> {

    if (this.formulario.invalid || this.cargando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.error.set('');

    const {
      correo,
      codigo,
      password,
      confirmarPassword
    } = this.formulario.getRawValue();

    if (password !== confirmarPassword) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    if (password === 'Ecuador2026') {
      this.error.set('Selecciona una contraseña diferente a la inicial.');
      return;
    }

    this.cargando.set(true);

    try {

      await this.authService.recuperarConCodigo(
        correo,
        codigo,
        password
      );

      this.exito.set(true);
      this.formulario.reset();

    } catch (error) {

      console.error(error);

      this.error.set(
        'No se pudo actualizar la contraseña. Comprueba el código o solicita uno nuevo.'
      );

    } finally {
      this.cargando.set(false);
    }
  }

  solicitarOtroCodigo(): void {
    this.router.navigateByUrl('/recuperar-password');
  }

  regresar(): void {
    this.router.navigateByUrl('/login', {
      replaceUrl: true
    });
  }
}