import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ParkingResponse<T = any> {
  ok: boolean;
  data: T[];
}

@Injectable({
  providedIn: 'root'
})
export class ParkingService {
  private apiUrl = `${environment.apiUrl}/parkings`;

  constructor(private http: HttpClient) {}

  getAvailableParkings<T = any>(): Observable<ParkingResponse<T>> {
    return this.http.get<ParkingResponse<T>>(`${this.apiUrl}/available`);
  }
}