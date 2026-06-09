import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { personCircleOutline, star, locationOutline, carSportOutline } from 'ionicons/icons';

interface Estacionamiento {
  id: number;
  direccion: string;
  latitud: number;
  longitud: number;
  precio_hora: number;
  descripcion: string; // Asegúrate de tener esto en tu DB o Mock
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, GoogleMapsModule, HttpClientModule]
})
export class HomePage implements OnInit {
  center: google.maps.LatLngLiteral = { lat: -33.0456, lng: -71.6203 };
  zoom = 14;
  estacionamientos: Estacionamiento[] = [];
  marcadores: any[] = [];

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {
    addIcons({ personCircleOutline, star, locationOutline, carSportOutline });
  }

  ngOnInit() {
    this.cargarEstacionamientos();
  }

  cargarEstacionamientos() {
    this.http.get<{ok: boolean, data: Estacionamiento[]}>('http://localhost:3000/api/parkings/available')
      .subscribe({
        next: (res) => {
          if (res.ok) {
            this.estacionamientos = res.data;
            this.configurarMarcadores();
          }
        }
      });
  }

  configurarMarcadores() {
    this.marcadores = this.estacionamientos.map(est => ({
      position: { lat: est.latitud, lng: est.longitud },
      title: est.direccion,
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
}