import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing', // Cambiamos el inicio por defecto
    pathMatch: 'full',
  },
  {
    path: 'landing',
    // Aquí irá tu nueva Landing Page (Primera imagen)
    loadComponent: () => import('./pages/landing/landing.page').then((m) => m.LandingPage),
  },
  {
    path: 'search', 
    // Este será tu mapa de búsqueda (Segunda imagen). ¡Sin AuthGuard!
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'reservations/new',
    loadComponent: () => import('./pages/reservations/new-reservation.page').then((m) => m.NewReservationPage),
    // La reserva SÍ está fuertemente protegida
    canActivate: [AuthGuard],
    data: { roles: ['Conductor'] }
  }
];