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
  searchOutline, closeOutline, filterOutline, notificationsOutline, chevronDownOutline
} from 'ionicons/icons';

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
  
  // Datos simulados para la UI (ya que la BD original no los incluye)
  duracionHoras: number = 4;
  totalPagar: number = 12000;
  distancia: string = '0,3 km';
  rating: number = 4.8;
  reviews: number = 128;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    addIcons({
      'arrow-back-outline': arrowBackOutline, 'location-outline': locationOutline,
      'calendar-outline': calendarOutline, 'time-outline': timeOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline, 'star': star,
      'heart-outline': heartOutline, 'lock-closed-outline': lockClosedOutline,
      'business-outline': businessOutline, 'car-outline': carOutline,
      'chevron-forward-outline': chevronForwardOutline, 'search-outline': searchOutline,
      'close-outline': closeOutline, 'filter-outline': filterOutline,
      'notifications-outline': notificationsOutline, 'chevron-down-outline': chevronDownOutline
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.estacionamientoId = Number(params['id']);
        this.cargarDetalleEstacionamiento(this.estacionamientoId);
      }
    });
  }

  cargarDetalleEstacionamiento(id: number) {
    // Para simplificar y no crear un nuevo endpoint ahora, usamos los datos disponibles
    this.http.get<{ok: boolean, data: any[]}>('http://localhost:3000/api/parkings/available')
      .subscribe({
        next: (res) => {
          if (res.ok) {
            const encontrado = res.data.find(e => e.id === id);
            if (encontrado) {
              this.estacionamiento = {
                id: encontrado.id,
                direccion: encontrado.direccion,
                precio_hora: encontrado.precio_hora,
                descripcion: encontrado.descripcion || 'Espacio privado dentro de propiedad residencial, disponible a través de convenio con el dueño o la administración del edificio. Ideal para estadías cortas o largas. Seguro, tranquilo y de fácil acceso en el corazón de Cerro Alegre.',
                nombre: 'Garage Privado Cerro Alegre' // Simulado para coincidir con el diseño
              };
              this.calcularTotal();
            }
          }
        }
      });
  }

  calcularTotal() {
    if (this.estacionamiento) {
      this.totalPagar = this.duracionHoras * this.estacionamiento.precio_hora;
    }
  }

  volver() {
    this.router.navigate(['/search']);
  }

  continuarPago() {
    if (this.estacionamientoId) {
      this.router.navigate(['/payments/checkout'], { 
        queryParams: { 
          id_estacionamiento: this.estacionamientoId,
          total: this.totalPagar 
        } 
      });
    }
  }
}