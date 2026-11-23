
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import {
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonText,
  ToastController
} from '@ionic/angular';

import { AuthService } from '../../../core/services/auth.service';
import { SUPABASE_CLIENT } from '../../../core/data/supabase.client';

@Component({
  selector: 'app-restablecer-password',
  templateUrl: './restablecer-password.page.html',
  styleUrls: ['./restablecer-password.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonInput,
    IonButton,
    IonItem,
    IonLabel,
    IonText,
    RouterLink
  ]
})
export class RestablecerPasswordPage {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);
  private readonly supabase = inject(SUPABASE_CLIENT);

  readonly authService = inject(AuthService);

  enlaceValido = false;
  verificando = true;

  formulario = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmar: ['', [Validators.required]]
  });

  constructor() {
    this.verificarEnlace();
  }

  async verificarEnlace(): Promise<void> {
    try {
      const url = new URL(window.location.href);
      const codigo = url.searchParams.get('code');
      const tokenHash = url.searchParams.get('token_hash');
      const tipo = url.searchParams.get('type');

      if (codigo) {
        const { error } =
          await this.supabase.auth.exchangeCodeForSession(codigo);

        if (error) {
          throw error;
        }

        this.enlaceValido = true;

      } else if (tokenHash && tipo === 'recovery') {
        const { error } = await this.supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery'
        });

        if (error) {
          throw error;
        }

        this.enlaceValido = true;

      } else {
        // Enlaces que ya establecieron una sesión durante la redirección.
        const { data } = await this.supabase.auth.getSession();
        this.enlaceValido = !!data.session;
      }

    } catch (error) {
      console.error('Enlace de recuperación inválido:', error);
      this.enlaceValido = false;

    } finally {
      this.verificando = false;
    }
  }

  async guardar(): Promise<void> {
    if (!this.enlaceValido) {
      return;
    }

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { password, confirmar } = this.formulario.getRawValue();

    if (password !== confirmar) {
      await this.mostrarMensaje('Las contraseñas no coinciden.', 'danger');
      return;
    }

    if (password === 'Ecuador2026') {
      await this.mostrarMensaje(
        'Utiliza una contraseña diferente a la inicial.',
        'danger'
      );
      return;
    }

    const correcto = await this.authService.restablecerPassword(password!);

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

    await this.authService.cerrarSesion();

    await this.router.navigateByUrl('/login', {
      replaceUrl: true
    });
  }

  private async mostrarMensaje(
    mensaje: string,
    color: 'success' | 'danger'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      color,
      duration: 3000,
      position: 'top'
    });

    await toast.present();
  }
}
