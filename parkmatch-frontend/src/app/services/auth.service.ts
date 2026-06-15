import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User, AuthResponse, LoginDTO, RegisterDTO } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private authSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('PM_TOKEN');
  }

  isAuthenticated(): Observable<boolean> {
    return this.authSubject.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem('PM_TOKEN');
  }

  getUserRole(): 'Conductor' | 'Propietario' | 'Administrador' | null {
    const userJson = localStorage.getItem('PM_USER');
    if (!userJson) return null;
    const user = JSON.parse(userJson) as User;
    return user.tipo_usuario;
  }

  register(userData: RegisterDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => {
        if (res.ok && res.token && res.user) {
          this.storeSession(res.token, res.user);
        }
      })
    );
  }

  login(credentials: LoginDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.ok && res.token && res.user) {
          this.storeSession(res.token, res.user);
        }
      })
    );
  }

  private storeSession(token: string, user: User) {
    localStorage.setItem('PM_TOKEN', token);
    localStorage.setItem('PM_USER', JSON.stringify(user));
    this.authSubject.next(true);
  }

  logout() {
    localStorage.removeItem('PM_TOKEN');
    localStorage.removeItem('PM_USER');
    this.authSubject.next(false);
  }
}