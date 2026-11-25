import {
  Component,
  inject,
  signal,
  computed
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonSelect,
  IonSelectOption
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  documentTextOutline,
  barChartOutline,
  refreshOutline,
  cameraOutline,
  locationOutline
} from 'ionicons/icons';

import { ActasService } from '../../../core/services/actas.service';
import { ElectoralService } from '../../../core/services/electoral.service';
import { RecintosService } from '../../../core/services/recintos.service';
import { EvidenciasService } from '../../../core/services/evidencias.service';

import {
  Acta,
  Dignidad
} from '../../../core/models/acta.model';

@Component({
  selector: 'app-control',
  templateUrl: './control.page.html',
  styleUrls: ['./control.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonSelect,
    IonSelectOption
  ]
})
export class ControlPage {

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly actasService = inject(ActasService);
  readonly electoral = inject(ElectoralService);
  readonly recintosService = inject(RecintosService);
  readonly evidencias = inject(EvidenciasService);

  readonly seccion =
    signal<'actas' | 'resultados'>('actas');

  readonly dignidad =
    signal<Dignidad>('alcaldia');

  readonly recintoSeleccionado = signal(0);

  readonly cargando = signal(false);
  readonly error = signal('');

  readonly actaSeleccionada = signal<Acta | null>(null);

  readonly mostrarFoto = signal(false);

  // Filtrar las juntas según el recinto.
  readonly juntasFiltradas = computed(() => {

    const recinto = this.recintoSeleccionado();

    const juntas = this.electoral.juntas();

    return recinto === 0
      ? juntas
      : juntas.filter(j => j.recinto_id === recinto);
  });

  // Filtrar las actas según el recinto.
  readonly actasDelRecinto = computed(() => {

    const ids = new Set(
      this.juntasFiltradas().map(j => j.id)
    );

    return this.actasService.actas().filter(
      acta => ids.has(acta.jrv_id)
    );
  });

  // Filtrar las actas según la dignidad.
  readonly actasFiltradas = computed(() =>

    this.actasDelRecinto().filter(
      acta => acta.dignidad === this.dignidad()
    )
  );

  // Considerar únicamente actas finalizadas.
  readonly actasValidas = computed(() =>

    this.actasFiltradas().filter(
      acta =>
        acta.estado === 'registrada' ||
        acta.estado === 'corregida'
    )
  );

  readonly totalJuntas = computed(() =>

    this.juntasFiltradas().length
  );

  readonly juntasCompletadas = computed(() =>

    this.juntasFiltradas().filter(
      junta => junta.estado === 'completada'
    ).length
  );

  readonly totalEsperadas = computed(() =>

    this.recintosService.recintos()
      .filter(recinto =>
        this.recintoSeleccionado() === 0 ||
        recinto.id === this.recintoSeleccionado()
      )
      .reduce(
        (total, recinto) =>
          total + recinto.cantidad_jrv,
        0
      )
  );

  readonly avance = computed(() => {

    const total = this.totalEsperadas();

    return total === 0
      ? 0
      : Math.round(
          this.juntasCompletadas() * 100 / total
        );
  });

  readonly totalSufragantes = computed(() =>

    this.actasValidas().reduce(
      (total, acta) =>
        total + acta.total_sufragantes,
      0
    )
  );

  readonly totalNulos = computed(() =>

    this.actasValidas().reduce(
      (total, acta) =>
        total + acta.votos_nulos,
      0
    )
  );

  readonly totalBlancos = computed(() =>

    this.actasValidas().reduce(
      (total, acta) =>
        total + acta.votos_blancos,
      0
    )
  );

  // Calcular los votos acumulados por candidatura.
  readonly resultados = computed(() => {

    const idsActas = new Set(
      this.actasValidas().map(acta => acta.id)
    );

    const votosPorCandidato = new Map<number, number>();

    for (
      const resultado of
      this.actasService.resultadosProvinciales()
    ) {

      if (!idsActas.has(resultado.acta_id)) {
        continue;
      }

      const votos =
        votosPorCandidato.get(
          resultado.candidatura_id
        ) ?? 0;

      votosPorCandidato.set(
        resultado.candidatura_id,
        votos + resultado.cantidad_votos
      );
    }

    return this.actasService.candidaturasProvinciales()

      .filter(
        candidato =>
          candidato.dignidad === this.dignidad()
      )

      .map(candidato => ({

        id: candidato.id,

        nombre:
          `${candidato.nombre_candidato} ${candidato.apellidos_candidato}`,

        organizacion: candidato.organizacion.nombre,

        votos:
          votosPorCandidato.get(candidato.id) ?? 0

      }))

      .sort((a, b) => b.votos - a.votos);
  });

  readonly totalVotosValidos = computed(() =>

    this.resultados().reduce(
      (total, candidato) => total + candidato.votos,
      0
    )
  );

  constructor() {

    addIcons({
      arrowBackOutline,
      documentTextOutline,
      barChartOutline,
      refreshOutline,
      cameraOutline,
      locationOutline
    });
  }

  async ionViewWillEnter(): Promise<void> {

    const seccion =
      this.route.snapshot.queryParamMap.get('seccion');

    this.seccion.set(
      seccion === 'resultados'
        ? 'resultados'
        : 'actas'
    );

    await this.cargarDatos();
  }

  // Cargar la información del panel.
  async cargarDatos(): Promise<void> {

    this.cargando.set(true);
    this.error.set('');
    this.actaSeleccionada.set(null);
    this.mostrarFoto.set(false);

    try {

      await this.recintosService.cargarRecintos();

      if (this.recintosService.error()) {

        throw new Error(
          this.recintosService.error() ??
          'No se pudieron cargar los recintos.'
        );
      }

      const [juntas, actas] = await Promise.all([

        this.electoral.cargarJuntasProvinciales(),

        this.actasService.cargarControlProvincial()

      ]);

      if (!juntas) {

        throw new Error(this.electoral.error());
      }

      if (!actas) {

        throw new Error(this.actasService.error());
      }

    } catch (error) {

      const detalle = error as { message?: string };

      this.error.set(
        detalle.message ??
        'No se pudo cargar la información provincial.'
      );

    } finally {

      this.cargando.set(false);
    }
  }

  cambiarSeccion(
    seccion: 'actas' | 'resultados'
  ): void {

    this.seccion.set(seccion);
    this.actaSeleccionada.set(null);
    this.mostrarFoto.set(false);
  }

  cambiarDignidad(dignidad: Dignidad): void {

    this.dignidad.set(dignidad);
    this.actaSeleccionada.set(null);
    this.mostrarFoto.set(false);
  }

  cambiarRecinto(evento: Event): void {

    const detalle = (
      evento as CustomEvent<{ value: number }>
    ).detail;

    this.recintoSeleccionado.set(
      Number(detalle.value)
    );

    this.actaSeleccionada.set(null);
    this.mostrarFoto.set(false);
  }

  obtenerNumeroJunta(jrvId: number): number | string {

    return this.electoral.juntas().find(
      junta => junta.id === jrvId
    )?.numero ?? 'Sin información';
  }

  obtenerRecinto(jrvId: number): string {

    const junta = this.electoral.juntas().find(
      j => j.id === jrvId
    );

    return this.recintosService.recintos().find(
      recinto => recinto.id === junta?.recinto_id
    )?.nombre ?? 'Sin información';
  }

  obtenerPorcentaje(votos: number): number {

    const total = this.totalVotosValidos();

    return total === 0
      ? 0
      : Math.round(votos * 1000 / total) / 10;
  }

  obtenerVotosActa(
    actaId: number,
    candidaturaId: number
  ): number {

    return this.actasService.resultadosProvinciales()
      .find(resultado =>

        resultado.acta_id === actaId &&
        resultado.candidatura_id === candidaturaId

      )?.cantidad_votos ?? 0;
  }

  seleccionarActa(acta: Acta): void {

    this.actaSeleccionada.set(acta);
    this.mostrarFoto.set(false);
  }

  cerrarDetalle(): void {

    this.actaSeleccionada.set(null);
    this.mostrarFoto.set(false);
  }

  async consultarFoto(acta: Acta): Promise<void> {

    this.mostrarFoto.set(false);

    const resultado =
      await this.evidencias.cargarActa(acta.id);

    if (
      resultado &&
      this.actaSeleccionada()?.id === acta.id
    ) {

      this.mostrarFoto.set(true);
    }
  }

  regresar(): void {

    this.router.navigateByUrl('/provincial');
  }
}