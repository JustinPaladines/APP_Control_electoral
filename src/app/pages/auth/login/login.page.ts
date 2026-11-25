
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

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
  personOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';
import { cedulaEcuatorianaValidator } from '../../../core/validators/cedula-ecuatoriana.validator';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonItem,
    IonLabel,
    RouterLink
  ]
})
export class LoginPage {

  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  readonly authService = inject(AuthService);

  loginForm: FormGroup;

  mostrarPassword = false;

  

  constructor() {

    addIcons({
      personOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      shieldCheckmarkOutline
    });

    this.loginForm = this.formBuilder.group({
      cedula: [
        '',
        [
          Validators.required,
          cedulaEcuatorianaValidator()
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ]
    });
  }

  async iniciarSesion(): Promise<void> {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { cedula, password } = this.loginForm.getRawValue();

    const accesoCorrecto = await this.authService.iniciarSesion(
      cedula,
      password
    );

    if (!accesoCorrecto) {
      await this.mostrarMensaje(
        this.authService.error() ?? 'No se pudo iniciar sesión.',
        'danger'
      );
      return;
    }

    const perfil = this.authService.perfil();

    if (!perfil) {
      await this.mostrarMensaje(
        'No se pudo recuperar el perfil del usuario.',
        'danger'
      );
      return;
    }

    if (perfil.debe_cambiar_clave) {
    await this.router.navigateByUrl('/cambiar-password', {
        replaceUrl: true
    });
    return;
    }

    await this.mostrarMensaje(
      'Inicio de sesión correcto.',
      'success'
    );

    if (perfil.rol === 'provincial') {

      await this.router.navigateByUrl('/provincial', {
        replaceUrl: true
      });

    } else if (perfil.rol === 'recinto') {

      await this.router.navigateByUrl('/recinto', {
        replaceUrl: true
      });

    } else if (perfil.rol === 'veedor') {

      await this.router.navigateByUrl('/veedor', {
        replaceUrl: true
      });

    }

  }

  cambiarVisibilidadPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
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

  irConfirmarCuenta(): void {
    this.router.navigateByUrl('/confirmar-cuenta');
  }
}
