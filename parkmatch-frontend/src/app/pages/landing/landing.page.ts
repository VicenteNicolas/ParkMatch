import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { 
  locationOutline, 
  calendarOutline, 
  shieldCheckmarkOutline,
  searchOutline,
  businessOutline,
  waterOutline,
  ticketOutline,
  bagHandleOutline,
  schoolOutline,
  personCircleOutline // Necesario para el ícono del perfil
} from 'ionicons/icons';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class LandingPage implements OnInit {
  isLoggedIn: boolean = false;
  userName: string = '';
  // Puedes cambiar la ruta de la imagen por una variable dinámica si la tienes
  userProfilePic: string = 'assets/icon/default-profile.png'; 

  constructor(private router: Router, private authService: AuthService) {
    // Registramos todos los íconos necesarios
    addIcons({
      'location-outline': locationOutline,
      'calendar-outline': calendarOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'search-outline': searchOutline,
      'business-outline': businessOutline,
      'water-outline': waterOutline,
      'ticket-outline': ticketOutline,
      'bag-handle-outline': bagHandleOutline,
      'school-outline': schoolOutline,
      'person-circle-outline': personCircleOutline
    });
  }

  ngOnInit() {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    // Verificamos si existe un token en el servicio
    this.isLoggedIn = !!this.authService.getToken();
    
    if (this.isLoggedIn) {
      // Obtenemos los datos del usuario guardados (ajusta según tu lógica en AuthService)
      const userJson = localStorage.getItem('PM_USER');
      if (userJson) {
        const user = JSON.parse(userJson);
        this.userName = user.nombre || 'Usuario';
      }
    }
  }

  buscarEstacionamiento() {
    this.router.navigate(['/search']);
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/landing']);
  }
}