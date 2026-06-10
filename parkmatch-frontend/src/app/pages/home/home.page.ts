import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
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
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, GoogleMapsModule, HttpClientModule]
})
export class HomePage implements OnInit {
  // Coordenadas centrales de Valparaíso
  center: google.maps.LatLngLiteral = { lat: -33.0456, lng: -71.6203 };
  zoom = 14;
  estacionamientos: Estacionamiento[] = [];
  marcadores: any[] = [];

  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    mapId: "DEMO_MAP_ID" // Ayuda a modernizar la vista del mapa
  };

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {
    addIcons({ 
      personCircleOutline, star, locationOutline, carSportOutline,
      searchOutline, closeOutline, calendarOutline, timeOutline, 
      filterOutline, notificationsOutline, heartOutline, heart, 
      walkOutline, chevronDownOutline, informationCircle, mapOutline
    });
  }

  ngOnInit() {
    this.cargarEstacionamientos();
  }

  cargarEstacionamientos() {
    this.http.get<{ok: boolean, data: Estacionamiento[]}>('http://localhost:3000/api/parkings/available')
      .subscribe({
        next: (res) => {
          if (res.ok) {
            // Asignamos datos visuales simulados a los estacionamientos reales de la BD
            this.estacionamientos = res.data.map((est, index) => {
              const tipos = ['Privado', 'Residencial', 'Privado', 'Convenio'];
              return {
                ...est,
                nombre: est.descripcion || 'Estacionamiento Disponible',
                tipo: tipos[index % 4], // Rota los tipos para que se vean como en el diseño
                rating: 4.5 + (Math.random() * 0.4), // Rating entre 4.5 y 4.9
                reviews: Math.floor(Math.random() * 100) + 50,
                tiempo: `${5 + (index * 2)} min`,
                distancia: `${300 + (index * 150)} m`,
                imagen: 'assets/icon/fondo-landing.png', // Opcional: Si tienes fotos reales, pon su ruta
                isFavorite: false
              };
            });
            this.configurarMarcadores();
          }
        },
        error: (err) => console.error('Error cargando los estacionamientos', err)
      });
  }

  configurarMarcadores() {
    this.marcadores = this.estacionamientos.map(est => ({
      position: { lat: est.latitud, lng: est.longitud },
      title: est.nombre,
      options: {
        animation: google.maps.Animation.DROP,
        // Agrega el precio como etiqueta encima del pin
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
      this.router.navigate(['/reservations/new'], { queryParams: { id: estacionamiento.id } });
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleFavorite(estacionamiento: Estacionamiento) {
    estacionamiento.isFavorite = !estacionamiento.isFavorite;
  }
}