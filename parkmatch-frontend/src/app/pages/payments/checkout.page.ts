import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { ParkingService } from '../../services/parking.service';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, calendarOutline, timeOutline, shieldCheckmarkOutline, 
  star, locationOutline, cardOutline, cashOutline, walletOutline, lockClosedOutline,
  chevronDownOutline, notificationsOutline, closeOutline, filterOutline, searchOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule]
})
export class CheckoutPage implements OnInit {
  totalPagar: number = 0;
  estacionamientoId: number | null = null;
  estacionamiento: any = null;
  
  fechaReserva: string = '';
  horaInicio: string = '';
  horaTermino: string = '';

  metodoPagoSeleccionado: string = 'Tarjeta de Crédito / Débito'; 
  procesando: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private parkingService: ParkingService
  ) {
    addIcons({
      arrowBackOutline, calendarOutline, timeOutline, shieldCheckmarkOutline, 
      star, locationOutline, cardOutline, cashOutline, walletOutline, lockClosedOutline,
      chevronDownOutline, notificationsOutline, closeOutline, filterOutline, searchOutline
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.totalPagar = Number(params['total']);
      this.estacionamientoId = Number(params['id_estacionamiento']);
      this.fechaReserva = params['fecha'];
      this.horaInicio = params['inicio'];
      this.horaTermino = params['termino'];

      this.cargarDatosEstacionamiento(this.estacionamientoId);
    });
  }

  cargarDatosEstacionamiento(id: number) {
    this.parkingService.getAvailableParkings<any>()
      .subscribe({
        next: (res) => {
          if (res.ok) {
            const encontrado = res.data.find(e => e.id === id);
            if (encontrado) {
              this.estacionamiento = {
                nombre: encontrado.descripcion || 'Estacionamiento Reservado',
                direccion: encontrado.direccion,
                imagen: 'assets/icon/fondo-landing.png'
              };
            }
          }
        }
      });
  }

  seleccionarMetodo(metodo: string) {
    this.metodoPagoSeleccionado = metodo;
  }

  volver() {
    this.router.navigate(['/reservations/booking'], { queryParams: { id: this.estacionamientoId } });
  }

  procesarPago() {
    this.procesando = true;
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Payload de la Fase 1: Creación de la reserva
    const reservaPayload = {
      id_estacionamiento: this.estacionamientoId,
      fecha_reserva: this.fechaReserva,
      hora_inicio: this.horaInicio,
      hora_fin: this.horaTermino,
      monto_total: this.totalPagar
    };

    // 1. Solicitud para crear la reserva
    this.http.post<{ok: boolean, message: string, id_reserva: number}>(
      `${environment.apiUrl}/reservations`, reservaPayload, { headers }
    ).subscribe({
      next: (resReserva) => {
        if (resReserva.ok && resReserva.id_reserva) {
          
          // Payload de la Fase 2: Confirmación del Pago
          const pagoPayload = {
            id_reserva: resReserva.id_reserva,
            metodo_pago: this.metodoPagoSeleccionado
          };

          // 2. Solicitud para procesar el pago y confirmar reserva
          this.http.post(`${environment.apiUrl}/payments`, pagoPayload, { headers }).subscribe({
            next: (resPago: any) => {
              this.procesando = false;
              if (resPago.ok) {
                // Todo fue exitoso, redirigimos a la pantalla de éxito
                this.router.navigate(['/reservations/success']);
              }
            },
            error: (errPago) => {
              this.procesando = false;
              console.error('Error al procesar el pago:', errPago);
              alert('Hubo un problema al procesar su pago, pero la reserva quedó Pendiente.');
            }
          });

        }
      },
      error: (errReserva) => {
        this.procesando = false;
        console.error('Error creando reserva:', errReserva);
        // Manejo del error de concurrencia definido en tu backend (CP-04)
        if (errReserva.status === 409) {
          alert('Este espacio ya fue reservado por otro usuario en el mismo horario. Por favor, seleccione otro.');
        } else {
          alert('Ocurrió un error al intentar crear la reserva.');
        }
      }
    });
  }
}