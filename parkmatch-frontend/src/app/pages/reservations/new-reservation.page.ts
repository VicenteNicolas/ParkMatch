import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, locationOutline, calendarOutline,
  timeOutline, shieldCheckmarkOutline, star, heartOutline,
  lockClosedOutline, businessOutline, carOutline, chevronForwardOutline,
  searchOutline, closeOutline, filterOutline, notificationsOutline,
  chevronDownOutline, addOutline, removeOutline
} from 'ionicons/icons';

import { environment } from '../../../environments/environment';

interface EstacionamientoDetalle {
  id: number;
  direccion: string;
  precio_hora: number;
  descripcion: string;
  nombre: string;
}

@Component({
  selector: 'app-new-reservation',
  templateUrl: './new-reservation.page.html',
  styleUrls: ['./new-reservation.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, HttpClientModule]
})
export class NewReservationPage implements OnInit {
  estacionamientoId: number | null = null;
  estacionamiento: EstacionamientoDetalle | null = null;

  // Lógica de Galería
  imagenes: string[] = [
    'assets/images/garage1.jpg',
    'assets/images/garage2.jpg',
    'assets/images/garage3.jpg',
    'assets/images/garage4.jpg'
  ];
  imagenActiva: string = this.imagenes[0];

  // Datos de Reserva
  private _duracionHoras: number = 4;
  get duracionHoras(): number { return this._duracionHoras; }
  set duracionHoras(val: number) {
    this._duracionHoras = val;
    this.calcularTotal(); // recalcula cada vez que cambia
  }

  totalPagar: number = 0; 
  distancia: string = '0,3 km';
  rating: number = 4.8;
  reviews: number = 128;


  isLoading: boolean = true;

  // Límites de duración
  readonly DURACION_MIN = 1;
  readonly DURACION_MAX = 12;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    addIcons({
      'arrow-back-outline':        arrowBackOutline,
      'location-outline':          locationOutline,
      'calendar-outline':          calendarOutline,
      'time-outline':              timeOutline,
      'shield-checkmark-outline':  shieldCheckmarkOutline,
      'star':                      star,
      'heart-outline':             heartOutline,
      'lock-closed-outline':       lockClosedOutline,
      'business-outline':          businessOutline,
      'car-outline':               carOutline,
      'chevron-forward-outline':   chevronForwardOutline,
      'search-outline':            searchOutline,
      'close-outline':             closeOutline,
      'filter-outline':            filterOutline,
      'notifications-outline':     notificationsOutline,
      'chevron-down-outline':      chevronDownOutline,
      'add-outline':               addOutline,
      'remove-outline':            removeOutline
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.estacionamientoId = Number(params['id']);
        this.cargarDetalleEstacionamiento(this.estacionamientoId);
      }
      
      if (params['duracion']) {
        this.duracionHoras = Number(params['duracion']);
        this.calcularTotal(); // Recalcula el precio inmediatamente
      }
    });
  }

  cargarDetalleEstacionamiento(id: number) {
    this.isLoading = true;
    this.http.get<{ ok: boolean; data: any[] }>(`${environment.apiUrl}/parkings/available`)
      .subscribe({
        next: (res) => {
          if (res.ok) {
            const encontrado = res.data.find(e => e.id === id);
            if (encontrado) {
              this.estacionamiento = {
                id:          encontrado.id,
                direccion:   encontrado.direccion,
                precio_hora: encontrado.precio_hora,
                descripcion: encontrado.descripcion ||
                  'Espacio privado dentro de propiedad residencial, disponible a través de ' +
                  'convenio con el dueño o la administración del edificio. Ideal para estadías ' +
                  'cortas o largas. Seguro, tranquilo y de fácil acceso en el corazón de Cerro Alegre.',
                nombre: 'Garage Privado Cerro Alegre'
              };
              this.calcularTotal();
            }
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  // Cambia la imagen principal de la galería
  seleccionarImagen(img: string) {
    this.imagenActiva = img;
  }


  calcularTotal() {
    if (this.estacionamiento) {
      this.totalPagar = this._duracionHoras * this.estacionamiento.precio_hora;
    }
  }


  incrementarDuracion() {
    if (this._duracionHoras < this.DURACION_MAX) {
      this.duracionHoras = this._duracionHoras + 1; // usa el setter
    }
  }

  decrementarDuracion() {
    if (this._duracionHoras > this.DURACION_MIN) {
      this.duracionHoras = this._duracionHoras - 1; // usa el setter
    }
  }

  volver() {
    this.router.navigate(['/search']);
  }

  configurarReserva() {
    if (this.estacionamientoId) {
      this.router.navigate(['/reservations/booking'], { 
        queryParams: { 
          id: this.estacionamientoId,
          duracion: this.duracionHoras 
        } 
      });
    }
  }
}