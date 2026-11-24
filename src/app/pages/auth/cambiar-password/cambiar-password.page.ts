
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
import {
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cambiar-password',
  templateUrl: './cambiar-password.page.html',
  styleUrls: ['./cambiar-password.page.scss'],
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
export class CambiarPasswordPage {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  readonly authService = inject(AuthService);

  mostrarPassword = false;
  mostrarConfirmacion = false;

  passwordForm = this.fb.group({
    nuevaPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(8)
      ]
    ],
    confirmarPassword: [
      '',
      [Validators.required]
    ]
  });

  constructor() {
    addIcons({
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      shieldCheckmarkOutline
    });
  }

  async cambiarPassword(): Promise<void> {

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { nuevaPassword, confirmarPassword } =
      this.passwordForm.getRawValue();

    if (nuevaPassword !== confirmarPassword) {
      await this.mostrarMensaje(
        'Las contraseñas no coinciden.',
        'danger'
      );
      return;
    }

    if (nuevaPassword === 'Ecuador2026') {
      await this.mostrarMensaje(
        'Debes elegir una contraseña diferente a la inicial.',
        'warning'
      );
      return;
    }

    const correcto = await this.authService.cambiarClaveInicial(
      nuevaPassword!
    );

    if (!correcto) {
      await this.mostrarMensaje(
        this.authService.error() ?? 'No se pudo cambiar la contraseña.',
        'danger'
      );
      return;
    }

    await this.mostrarMensaje(
      'Contraseña actualizada correctamente.',
      'success'
    );

    // La navegación por rol se completará con los paneles.
    const perfil = this.authService.perfil();

    if (perfil?.rol === 'provincial') {

      await this.router.navigateByUrl('/provincial', {
        replaceUrl: true
      });

    } else if (perfil?.rol === 'recinto') {

      await this.router.navigateByUrl('/recinto', {
        replaceUrl: true
      });

    } else if (perfil?.rol === 'veedor') {

      await this.router.navigateByUrl('/veedor', {
        replaceUrl: true
      });

    }
  }

  private async mostrarMensaje(
    mensaje: string,
    color: 'success' | 'danger' | 'warning'
  ): Promise<void> {

    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      color
    });

    await toast.present();
  }
}
