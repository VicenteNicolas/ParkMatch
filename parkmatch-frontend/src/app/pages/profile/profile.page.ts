import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { addIcons } from 'ionicons';
import {
  calendarOutline, heartOutline, cardOutline, personOutline, logOutOutline,
  locationOutline, carOutline, timeOutline, chevronDownOutline, notificationsOutline,
  searchOutline, closeOutline, filterOutline, star, businessOutline, pencilOutline,
  alertCircleOutline, callOutline, checkmarkCircleOutline, cashOutline, mapOutline, warningOutline
} from 'ionicons/icons';

import { Perfil, Reserva, Pago, ProfileView, ReservaTab } from '../../models/profile.models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, ReactiveFormsModule]
})
export class ProfilePage implements OnInit {

  perfil: Perfil | null = null;
  primerNombre: string = '';
  pagos: Pago[] = [];
  reservasActivas: Reserva[] = [];
  reservasHistorial: Reserva[] = [];

  isLoading: boolean = true;
  errorConexion: boolean = false;

  currentView: ProfileView = 'reservas';
  reservaTab: ReservaTab = 'proximas';

  isEditing: boolean = false;
  editForm!: FormGroup;
  isSaving: boolean = false;

  isDetailsModalOpen: boolean = false;
  selectedReserva: Reserva | null = null;
  cancelStep: 0 | 1 = 0;
  isCanceling: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
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
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarDatosReales();
    this.editForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required]
    });
  }

  cargarDatosReales(): void {
    this.profileService.getProfileData().subscribe({
      next: (res) => {
        if (res.ok) {
          this.perfil = res.perfil;
          this.actualizarPrimerNombre();
          this.clasificarReservas(res.reservas);
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
        if (err.status === 401) this.logout();
      }
    });
  }

  actualizarPrimerNombre(): void {
    if (this.perfil) {
      this.primerNombre = this.perfil.nombre.split(' ')[0];
    }
  }

  clasificarReservas(todasLasReservas: Reserva[]): void {
    const ahora = new Date(); // Fecha y hora actual exacta

    this.reservasActivas = [];
    this.reservasHistorial = [];

    todasLasReservas.forEach(res => {
      const datePart = res.fecha_reserva.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);


      const [horas, minutos] = res.hora_fin.split(':').map(Number);
      const fechaFinReserva = new Date(year, month - 1, day, horas, minutos);

      if (res.estado === 'Cancelada') {
        this.reservasHistorial.push(res);
      } else if (fechaFinReserva < ahora) {
        res.estado = 'Finalizada';
        this.reservasHistorial.push(res);
      } else {
        this.reservasActivas.push(res);
      }
    });
  }

  // --- NAVEGACIÓN Y RENDIMIENTO ---
  switchView(view: ProfileView): void {
    this.currentView = view;
    if (view === 'pagos') this.cargarPagos();
  }

  switchReservaTab(tab: ReservaTab): void {
    this.reservaTab = tab;
  }

  abrirRuta(direccion: string): void {
    window.open(`https://www.google.com/maps/search/?api=1&query=$${encodeURIComponent(direccion)}`, '_blank');
  }

  trackByReservaId(index: number, reserva: Reserva): number {
    return reserva.id_reserva;
  }

  trackByPagoId(index: number, pago: Pago): number {
    return pago.id;
  }

  // --- MODAL DETALLES DE RESERVA ---
  openDetailsModal(reserva: Reserva): void {
    this.selectedReserva = reserva;
    this.cancelStep = 0;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedReserva = null;
    this.cancelStep = 0;
  }

  iniciarCancelacion(): void { this.cancelStep = 1; }
  cancelarCancelacion(): void { this.cancelStep = 0; }

  confirmarCancelacion(): void {
    if (!this.selectedReserva) return;
    this.isCanceling = true;

    this.profileService.cancelReservation(this.selectedReserva.id_reserva).subscribe({
      next: (res) => {
        this.isCanceling = false;
        if (res.ok && this.selectedReserva) {
          this.selectedReserva.estado = 'Cancelada';
          this.reservasActivas = this.reservasActivas.filter(r => r.id_reserva !== this.selectedReserva?.id_reserva);
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

  responderReservaOwner(reserva: Reserva, estado: 'Confirmada' | 'Cancelada'): void {
    this.profileService.responderReserva(reserva.id_reserva, estado).subscribe({
      next: (res) => {
        if (res.ok) {
          reserva.estado = estado;
          if (estado === 'Cancelada') {
            this.reservasActivas = this.reservasActivas.filter(r => r.id_reserva !== reserva.id_reserva);
            this.reservasHistorial.unshift(reserva);
          }
        }
      },
      error: () => {
        alert(`Ocurrió un error al intentar marcar la reserva como ${estado}`);
      }
    });
  }

  // --- PAGOS Y PERFIL ---
  cargarPagos(): void {
    this.profileService.getPayments().subscribe(res => {
      if (res.ok) this.pagos = res.pagos;
    });
  }

  openEditModal(): void { this.isEditing = true; }
  closeEditModal(): void { this.isEditing = false; }

  guardarPerfil(): void {
    if (this.editForm.invalid || !this.perfil) return;
    this.isSaving = true;

    this.profileService.updateProfile(this.editForm.value).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.ok && this.perfil) {
          this.perfil.nombre = this.editForm.value.nombre;
          this.perfil.email = this.editForm.value.email;
          this.perfil.telefono = this.editForm.value.telefono;
          this.actualizarPrimerNombre();
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