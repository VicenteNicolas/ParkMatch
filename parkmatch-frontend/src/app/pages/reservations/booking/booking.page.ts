import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; 
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, locationOutline, calendarOutline, timeOutline,
  lockClosedOutline, star, informationCircleOutline, chevronDownOutline,
  closeOutline, filterOutline, notificationsOutline, walkOutline,
  pricetagOutline, walletOutline, shieldCheckmarkOutline 
} from 'ionicons/icons';

import { environment } from '../../../../environments/environment';

interface EstacionamientoDetalle {
  nombre: string;
  direccion: string;
  precio_hora: number;
  imagen: string;
}

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, HttpClientModule, RouterModule]
})
export class BookingPage implements OnInit {
  reservaForm!: FormGroup;
  estacionamientoId: number | null = null;
  estacionamiento: EstacionamientoDetalle | null = null;

  duracionCalculada: number = 0;
  totalPagar: number = 0;
  horasInvalidas: boolean = false; 
  isLoading: boolean = true;       

  fechaMinima: string = new Date().toISOString().split('T')[0];
  horaMinimaTermino: string = '10:30'; 

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    addIcons({
      arrowBackOutline, locationOutline, calendarOutline, timeOutline,
      lockClosedOutline, star, informationCircleOutline, chevronDownOutline,
      closeOutline, filterOutline, notificationsOutline, walkOutline,
      pricetagOutline, walletOutline, shieldCheckmarkOutline 
    });
  }

  ngOnInit() {
    this.reservaForm = this.fb.group({
      fecha:       [this.fechaMinima, Validators.required], 
      horaInicio:  ['10:00', Validators.required],
      horaTermino: ['13:00', Validators.required]
    });

    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.estacionamientoId = Number(params['id']);
        this.cargarEstacionamiento(this.estacionamientoId);
      }

      if (params['duracion']) {
        const horasExtra = Number(params['duracion']);
        const hFin = 10 + Math.floor(horasExtra);
        const mFin = (horasExtra % 1) * 60;
        const horaStr = `${hFin.toString().padStart(2, '0')}:${mFin === 0 ? '00' : '30'}`;
        
        this.reservaForm.patchValue({ horaTermino: horaStr });
      }
    });

    this.reservaForm.valueChanges.subscribe(() => this.calcularResumen());
  }

  cargarEstacionamiento(id: number) {
    this.isLoading = true;
    this.http.get<{ ok: boolean; data: any[] }>(`${environment.apiUrl}/parkings/available`)
      .subscribe({
        next: (res) => {
          if (res.ok) {
            const e = res.data.find(x => x.id === id);
            if (e) {
              this.estacionamiento = {
                nombre:     e.descripcion || 'Estacionamiento Disponible',
                direccion:  e.direccion,
                precio_hora: e.precio_hora,
                imagen:     'assets/icon/fondo-landing.png'
              };
              this.calcularResumen();
            }
          }
          this.isLoading = false; 
        },
        error: () => {
          this.isLoading = false; 
        }
      });
  }

  calcularResumen() {
    const inicio  = this.reservaForm?.get('horaInicio')?.value;
    const termino = this.reservaForm?.get('horaTermino')?.value;

    if (!inicio || !termino || !this.estacionamiento) return;

    const [hIn,  mIn]  = inicio.split(':').map(Number);
    const [hOut, mOut] = termino.split(':').map(Number);

    let minHoraTerminoH = hIn;
    let minHoraTerminoM = mIn + 30;
    if (minHoraTerminoM >= 60) {
      minHoraTerminoH += 1;
      minHoraTerminoM -= 60;
    }
    this.horaMinimaTermino = `${minHoraTerminoH.toString().padStart(2, '0')}:${minHoraTerminoM.toString().padStart(2, '0')}`;

    let diferencia = (hOut + mOut / 60) - (hIn + mIn / 60);

    if (diferencia <= 0) {
      this.horasInvalidas    = true;
      this.duracionCalculada = 0;
      this.totalPagar        = 0;
      return;
    }

    diferencia = Math.ceil(diferencia * 2) / 2;

    this.horasInvalidas    = false;
    this.duracionCalculada = diferencia;
    this.totalPagar        = this.duracionCalculada * this.estacionamiento.precio_hora;
  }

  get formularioValido(): boolean {
    return this.reservaForm.valid && !this.horasInvalidas && this.totalPagar > 0;
  }

  volver() {
    this.router.navigate(['/reservations/new'], {
      queryParams: { 
        id: this.estacionamientoId,
        duracion: this.duracionCalculada
     } 
    });
  }

  confirmarReserva() {
    if (this.formularioValido) {
      this.router.navigate(['/payments/checkout'], {
        queryParams: {
          id_estacionamiento: this.estacionamientoId,
          total: this.totalPagar,
          fecha: this.reservaForm.get('fecha')?.value,
          inicio: this.reservaForm.get('horaInicio')?.value,
          termino: this.reservaForm.get('horaTermino')?.value
        }
      });
    }
  }
}