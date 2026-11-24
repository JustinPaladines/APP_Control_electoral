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
import { keyOutline } from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.page.html',
  styleUrls: ['./recuperar-password.page.scss'],
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
export class RecuperarPasswordPage {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly cargando = signal(false);
  readonly error = signal('');

  formulario = this.fb.nonNullable.group({
    correo: ['', [
      Validators.required,
      Validators.email
    ]]
  });

  constructor() {
    addIcons({ keyOutline });
  }

  async enviarCodigo(): Promise<void> {

    if (this.formulario.invalid || this.cargando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    try {

      const correo = this.formulario.controls.correo.value
        .trim()
        .toLowerCase();

      const resultado = await this.authService.recuperarPassword(correo);

      if (resultado === false) {
        this.error.set('No se pudo enviar el código.');
        return;
      }

      this.router.navigate(['/restablecer-password'], {
        state: { correo }
      });

    } catch (error) {
      console.error(error);
      this.error.set('No se pudo enviar el código. Intenta más tarde.');

    } finally {
      this.cargando.set(false);
    }
  }

  regresar(): void {
    this.router.navigateByUrl('/login');
  }
}