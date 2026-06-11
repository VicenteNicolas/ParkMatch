import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, heartOutline, cardOutline, personOutline, logOutOutline,
  locationOutline, carOutline, timeOutline, chevronDownOutline, 
  notificationsOutline, searchOutline, closeOutline, filterOutline,
  star, businessOutline, pencilOutline, alertCircleOutline, callOutline,
  checkmarkCircleOutline, cashOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, HttpClientModule, ReactiveFormsModule]
})
export class ProfilePage implements OnInit {
  perfil: any = null;
  reservas: any[] = [];
  pagos: any[] = [];
  
  isLoading: boolean = true;
  errorConexion: boolean = false;
  
  currentView: 'reservas' | 'pagos' | 'favoritos' = 'reservas';
  
  isEditing: boolean = false;
  editForm!: FormGroup;
  isSaving: boolean = false;

  constructor(
    private router: Router, 
    private http: HttpClient,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    addIcons({
      calendarOutline, heartOutline, cardOutline, personOutline, logOutOutline,
      locationOutline, carOutline, timeOutline, chevronDownOutline,
      notificationsOutline, searchOutline, closeOutline, filterOutline,
      star, businessOutline, pencilOutline, alertCircleOutline, callOutline,
      checkmarkCircleOutline, cashOutline
    });
  }

  ngOnInit(): void {
    this.cargarDatosReales();
    
    this.editForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required]
    });
  }

  cargarDatosReales(): void {
    const token = this.authService.getToken();
    
    // FIX: Separamos la navegación del return para no devolver una Promesa
    if (!token) {
      this.router.navigate(['/login']);
      return; 
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<{ok: boolean, perfil: any, reservas: any[]}>(`${environment.apiUrl}/profile`, { headers })
      .subscribe({
        next: (res) => {
          if (res.ok) {
            this.perfil = res.perfil;
            this.reservas = res.reservas;
            
            this.editForm.patchValue({
              nombre: this.perfil.nombre,
              email: this.perfil.email,
              telefono: this.perfil.telefono
            });
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorConexion = true;
        }
      });
  }

  cargarPagos(): void {
    const token = this.authService.getToken();
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get<{ok: boolean, pagos: any[]}>(`${environment.apiUrl}/profile/payments`, { headers })
      .subscribe(res => {
        if (res.ok) this.pagos = res.pagos;
      });
  }

  switchView(view: 'reservas' | 'pagos' | 'favoritos'): void {
    this.currentView = view;
    if (view === 'pagos') {
      this.cargarPagos();
    }
  }

  openEditModal(): void { this.isEditing = true; }
  closeEditModal(): void { this.isEditing = false; }

  guardarPerfil(): void {
    if (this.editForm.invalid) return;
    
    this.isSaving = true;
    const token = this.authService.getToken();
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`${environment.apiUrl}/profile`, this.editForm.value, { headers })
      .subscribe({
        next: (res: any) => {
          this.isSaving = false;
          if (res.ok) {
            this.perfil.nombre = this.editForm.value.nombre;
            this.perfil.email = this.editForm.value.email;
            this.perfil.telefono = this.editForm.value.telefono;
            this.closeEditModal();
          }
        },
        error: () => {
          this.isSaving = false;
          alert('Error al guardar los cambios');
        }
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/landing']);
  }
}