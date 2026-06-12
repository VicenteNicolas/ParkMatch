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
  checkmarkCircleOutline, cashOutline, mapOutline, warningOutline
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
  pagos: any[] = [];
  
  // Arreglos separados para las pestañas
  reservasActivas: any[] = [];
  reservasHistorial: any[] = [];
  
  isLoading: boolean = true;
  errorConexion: boolean = false;
  
  // Vistas activas
  currentView: 'reservas' | 'pagos' | 'favoritos' = 'reservas';
  reservaTab: 'proximas' | 'historial' = 'proximas';
  
  // Modal Edición Perfil
  isEditing: boolean = false;
  editForm!: FormGroup;
  isSaving: boolean = false;

  // Modal Detalles de Reserva
  isDetailsModalOpen: boolean = false;
  selectedReserva: any = null;
  cancelStep: 0 | 1 = 0; // 0: Botón normal, 1: Confirmación
  isCanceling: boolean = false;

  constructor(
    private router: Router, 
    private http: HttpClient,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    addIcons({
      calendarOutline, heartOutline, cardOutline, personOutline, logOutOutline,
      locationOutline, carOutline, timeOutline, chevronDownOutline, notificationsOutline, 
      searchOutline, closeOutline, filterOutline, star, businessOutline, pencilOutline, 
      alertCircleOutline, callOutline, checkmarkCircleOutline, cashOutline, mapOutline, warningOutline
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
    if (!token) { this.router.navigate(['/login']); return; }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<{ok: boolean, perfil: any, reservas: any[]}>(`${environment.apiUrl}/profile`, { headers })
      .subscribe({
        next: (res) => {
          if (res.ok) {
            this.perfil = res.perfil;
            this.clasificarReservas(res.reservas);
            this.editForm.patchValue({
              nombre: this.perfil.nombre, email: this.perfil.email, telefono: this.perfil.telefono
            });
          }
          this.isLoading = false;
        },
        error: (err) => { this.isLoading = false; this.errorConexion = true; }
      });
  }

  clasificarReservas(todasLasReservas: any[]) {
    const hoy = new Date();
    today.setHours(0, 0, 0, 0);

    this.reservasActivas = [];
    this.reservasHistorial = [];

    todasLasReservas.forEach(res => {
      const fechaRes = new Date(res.fecha_reserva);
      if (res.estado === 'Cancelada' || fechaRes < hoy) {
        this.reservasHistorial.push(res);
      } else {
        this.reservasActivas.push(res);
      }
    });
  }

  // --- NAVEGACIÓN Y TABS ---
  switchView(view: 'reservas' | 'pagos' | 'favoritos'): void {
    this.currentView = view;
    if (view === 'pagos') this.cargarPagos();
  }

  switchReservaTab(tab: 'proximas' | 'historial'): void {
    this.reservaTab = tab;
  }

  abrirRuta(direccion: string): void {
    // Abre Google Maps en una pestaña nueva
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`, '_blank');
  }

  // --- MODAL DETALLES DE RESERVA ---
  openDetailsModal(reserva: any): void {
    this.selectedReserva = reserva;
    this.cancelStep = 0;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedReserva = null;
    this.cancelStep = 0;
  }

  iniciarCancelacion(): void {
    this.cancelStep = 1; // Muestra la doble confirmación
  }

  cancelarCancelacion(): void {
    this.cancelStep = 0; // Vuelve al botón original
  }

  confirmarCancelacion(): void {
    this.isCanceling = true;
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`${environment.apiUrl}/reservations/${this.selectedReserva.id_reserva}/cancel`, {}, { headers })
      .subscribe({
        next: (res: any) => {
          this.isCanceling = false;
          if (res.ok) {
            // Actualizamos el estado localmente para no hacer recarga completa
            this.selectedReserva.estado = 'Cancelada';
            
            // Movemos la reserva de activas a historial
            this.reservasActivas = this.reservasActivas.filter(r => r.id_reserva !== this.selectedReserva.id_reserva);
            this.reservasHistorial.unshift(this.selectedReserva);
            
            this.closeDetailsModal();
          }
        },
        error: () => {
          this.isCanceling = false;
          alert('Hubo un error al intentar cancelar la reserva.');
        }
      });
  }

  // --- PAGOS Y PERFIL (Mantenido de versión anterior) ---
  cargarPagos(): void {
    const token = this.authService.getToken();
    if (!token) return;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<{ok: boolean, pagos: any[]}>(`${environment.apiUrl}/profile/payments`, { headers })
      .subscribe(res => { if (res.ok) this.pagos = res.pagos; });
  }

  openEditModal(): void { this.isEditing = true; }
  closeEditModal(): void { this.isEditing = false; }
  
  guardarPerfil(): void {
    if (this.editForm.invalid) return;
    this.isSaving = true;
    const token = this.authService.getToken();
    if (!token) return;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`${environment.apiUrl}/profile`, this.editForm.value, { headers }).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res.ok) {
          this.perfil.nombre = this.editForm.value.nombre;
          this.perfil.email = this.editForm.value.email;
          this.perfil.telefono = this.editForm.value.telefono;
          this.closeEditModal();
        }
      },
      error: () => { this.isSaving = false; alert('Error al guardar los cambios'); }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/landing']);
  }
}

// Helper para fecha en clasificarReservas
const today = new Date();