import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      take(1),
      map(isAuth => {
        if (!isAuth) {
          this.router.navigate(['/login']);
          return false;
        }

        const expectedRoles = route.data['roles'] as Array<string>;
        const userRole = this.authService.getUserRole();

        if (expectedRoles && (!userRole || !expectedRoles.includes(userRole))) {
          // Si el rol no coincide con el esperado en la vista, redirigir al Home seguro
          this.router.navigate(['/home']);
          return false;
        }

        return true;
      })
    );
  }
}