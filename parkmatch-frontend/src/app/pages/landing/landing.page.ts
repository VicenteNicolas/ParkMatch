import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import {
  locationOutline, calendarOutline, shieldCheckmarkOutline,
  searchOutline, businessOutline, waterOutline, ticketOutline,
  bagHandleOutline, schoolOutline, personCircleOutline, logOutOutline 
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
  userProfilePic: string = 'assets/icon/default-profile.png';

  constructor(private router: Router, private authService: AuthService) {
    addIcons({
      'location-outline':         locationOutline,
      'calendar-outline':         calendarOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'search-outline':           searchOutline,
      'business-outline':         businessOutline,
      'water-outline':            waterOutline,
      'ticket-outline':           ticketOutline,
      'bag-handle-outline':       bagHandleOutline,
      'school-outline':           schoolOutline,
      'person-circle-outline':    personCircleOutline,
      'log-out-outline':          logOutOutline 
    });
  }

  ngOnInit() {
    this.checkAuthStatus();
  }


  ionViewWillEnter() {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    this.isLoggedIn = !!this.authService.getToken();

    if (this.isLoggedIn) {
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