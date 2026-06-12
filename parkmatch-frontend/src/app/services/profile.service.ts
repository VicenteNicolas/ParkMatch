import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Perfil, Reserva, Pago } from '../models/profile.models';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getProfileData(): Observable<{ok: boolean, perfil: Perfil, reservas: Reserva[]}> {
    return this.http.get<{ok: boolean, perfil: Perfil, reservas: Reserva[]}>(
      `${environment.apiUrl}/profile`, { headers: this.getHeaders() }
    );
  }

  getPayments(): Observable<{ok: boolean, pagos: Pago[]}> {
    return this.http.get<{ok: boolean, pagos: Pago[]}>(
      `${environment.apiUrl}/profile/payments`, { headers: this.getHeaders() }
    );
  }

  updateProfile(data: Partial<Perfil>): Observable<{ok: boolean, message: string}> {
    return this.http.put<{ok: boolean, message: string}>(
      `${environment.apiUrl}/profile`, data, { headers: this.getHeaders() }
    );
  }

  cancelReservation(idReserva: number): Observable<{ok: boolean, message: string}> {
    return this.http.put<{ok: boolean, message: string}>(
      `${environment.apiUrl}/reservations/${idReserva}/cancel`, {}, { headers: this.getHeaders() }
    );
  }
}