import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

import { environment } from '../../environments/environment';
import { CreateReservationDTO, PaymentRequestDTO, TransactionResponse } from '../models/transaction.models';
import { Reserva } from '../models/profile.models';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  createReservation(data: CreateReservationDTO): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.apiUrl}/reservations`, data, { headers: this.getHeaders() });
  }

  getMyReservations(): Observable<{ok: boolean, data: Reserva[]}> {
    return this.http.get<{ok: boolean, data: Reserva[]}>(`${this.apiUrl}/reservations`, { headers: this.getHeaders() });
  }

  processPayment(data: PaymentRequestDTO): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.apiUrl}/payments`, data, { headers: this.getHeaders() });
  }
}