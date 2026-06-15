import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { AuthService } from '../../services/auth.service';
import { ParkingService } from '../../services/parking.service';
import { addIcons } from 'ionicons';
import { 
  personCircleOutline, star, locationOutline, carSportOutline,
  searchOutline, closeOutline, calendarOutline, timeOutline, 
  filterOutline, notificationsOutline, heartOutline, heart, 
  walkOutline, chevronDownOutline, informationCircle, mapOutline
} from 'ionicons/icons';

interface Estacionamiento {
  id: number;
  direccion: string;
  latitud: number;
  longitud: number;
  precio_hora: number;
  descripcion: string;
  nombre?: string;
  tipo?: string;
  rating?: number;
  reviews?: number;
  tiempo?: string;
  distancia?: string;
  imagen?: string;
  isFavorite?: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, GoogleMapsModule]
})
export class HomePage implements OnInit {
  center: google.maps.LatLngLiteral = { lat: -33.0456, lng: -71.6203 };
  zoom = 14;
  
  usuarioNombre: string = 'Usuario';
  
  todosLosEstacionamientos: Estacionamiento[] = [];
  estacionamientos: Estacionamiento[] = [];
  marcadores: any[] = [];

  horaInicio: string = '08:00';
  horaTermino: string = '12:00';

  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    mapId: "DEMO_MAP_ID" 
  };

  constructor(private authService: AuthService, private router: Router, private parkingService: ParkingService) {
    addIcons({ 
      personCircleOutline, star, locationOutline, carSportOutline,
      searchOutline, closeOutline, calendarOutline, timeOutline, 
      filterOutline, notificationsOutline, heartOutline, heart, 
      walkOutline, chevronDownOutline, informationCircle, mapOutline
    });
  }

  ngOnInit() {
    this.cargarDatosUsuario();
    this.cargarEstacionamientos();
  }

  cargarDatosUsuario() {
    const userJson = localStorage.getItem('PM_USER');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.usuarioNombre = user.nombre.split(' ')[0]; 
    }
  }

  cargarEstacionamientos() {
    this.parkingService.getAvailableParkings<Estacionamiento>()
      .subscribe({
        next: (res) => {
          if (res.ok) {
            this.todosLosEstacionamientos = res.data.map((est, index) => {
              const tipos = ['Privado', 'Residencial', 'Privado', 'Convenio'];
              
              // FIX: Corregimos el problema de codificación de la BD visualmente
              const direccionCorregida = est.direccion ? est.direccion.replace('Valpara??so', 'Valparaíso') : '';

              return {
                ...est,
                direccion: direccionCorregida, // Se asigna la dirección corregida
                nombre: est.descripcion || 'Estacionamiento Disponible',
                tipo: tipos[index % 4], 
                rating: 4.5 + (Math.random() * 0.4), 
                reviews: Math.floor(Math.random() * 100) + 50,
                tiempo: `${5 + (index * 2)} min`,
                distancia: `${300 + (index * 150)} m`,
                imagen: 'assets/icon/fondo-landing.png', 
                isFavorite: false
              };
            });
            this.aplicarFiltroHorario(); 
          }
        },
        error: (err) => console.error('Error cargando estacionamientos', err)
      });
  }

  aplicarFiltroHorario() {
    if (this.horaInicio >= this.horaTermino) {
      this.estacionamientos = [];
    } else {
      this.estacionamientos = [...this.todosLosEstacionamientos];
    }
    this.configurarMarcadores();
  }

  configurarMarcadores() {
    this.marcadores = this.estacionamientos.map(est => ({
      position: { lat: est.latitud, lng: est.longitud },
      title: est.nombre,
      options: {
        animation: google.maps.Animation.DROP,
        label: {
          text: `$${est.precio_hora}`,
          color: '#0b2447',
          fontWeight: 'bold',
          className: 'map-price-label'
        }
      },
      data: est
    }));
  }

  iniciarReserva(estacionamiento: Estacionamiento) {
    const token = this.authService.getToken();
    if (token) {
      this.router.navigate(['/reservations/new'], { 
        queryParams: { id: estacionamiento.id } 
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleFavorite(estacionamiento: Estacionamiento, event: Event) {
    // Detiene la propagación para que al hacer clic en el corazón no se abra la reserva
    event.stopPropagation(); 
    estacionamiento.isFavorite = !estacionamiento.isFavorite;
  }
}