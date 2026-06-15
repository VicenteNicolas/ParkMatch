import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

import { environment } from '../../environments/environment';

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

  createReservation(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservations`, data, { headers: this.getHeaders() });
  }

  getMyReservations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservations`, { headers: this.getHeaders() });
  }

  processPayment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments`, data, { headers: this.getHeaders() });
  }
}