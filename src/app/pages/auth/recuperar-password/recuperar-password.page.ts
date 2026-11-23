
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonItem,
  IonLabel,
  ToastController
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import { mailOutline, arrowBackOutline } from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.page.html',
  styleUrls: ['./recuperar-password.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonItem,
    IonLabel
  ]
})
export class RecuperarPasswordPage {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastController);

  readonly authService = inject(AuthService);

  formulario = this.fb.group({
    correo: ['', [Validators.required, Validators.email]]
  });

  constructor() {
    addIcons({ mailOutline, arrowBackOutline });
  }

  async enviarSolicitud(): Promise<void> {

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const correo = this.formulario.controls.correo.value!;

    const correcto = await this.authService.recuperarPassword(correo);

    const mensaje = correcto
      ? 'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.'
      : 'No se pudo procesar la solicitud. Inténtalo nuevamente.';

    const aviso = await this.toast.create({
      message: mensaje,
      duration: 4000,
      position: 'top',
      color: correcto ? 'success' : 'danger'
    });

    await aviso.present();
  }

  regresar(): void {
    this.router.navigateByUrl('/login');
  }
}
