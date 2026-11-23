
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
  IonSpinner
} from '@ionic/angular';

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
    IonSpinner
  ]
})
export class RecintosPage implements OnInit {

  private readonly router = inject(Router);

  readonly recintosService = inject(RecintosService);

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
    // El formulario de creación se implementará en el siguiente paso.
  }
}
