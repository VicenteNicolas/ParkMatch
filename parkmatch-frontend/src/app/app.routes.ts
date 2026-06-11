import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full',
  },
  {
    path: 'landing',
    loadComponent: () => import('./pages/landing/landing.page').then((m) => m.LandingPage),
  },
  {
    path: 'search',
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
    canActivate: [AuthGuard],
    data: { roles: ['Conductor'] }
  },
  {
    path: 'reservations/booking',
    loadComponent: () => import('./pages/reservations/booking/booking.page').then(m => m.BookingPage)
  },
  {
    path: 'payments/checkout',
    loadComponent: () => import('./pages/payments/checkout.page').then(m => m.CheckoutPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
  }

];