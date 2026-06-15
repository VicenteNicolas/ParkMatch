import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Estacionamiento, ParkingResponse } from '../models/parking.models';

@Injectable({
  providedIn: 'root'
})
export class ParkingService {
  private apiUrl = `${environment.apiUrl}/parkings`;

  constructor(private http: HttpClient) {}

  getAvailableParkings<T = Estacionamiento>(): Observable<ParkingResponse<T>> {
    return this.http.get<ParkingResponse<T>>(`${this.apiUrl}/available`);
  }
}