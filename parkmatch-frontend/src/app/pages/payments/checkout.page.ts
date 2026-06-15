import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ParkingService } from '../../services/parking.service';
import { TransactionService } from '../../services/transaction.service';
import { switchMap } from 'rxjs/operators';
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
  imports: [CommonModule, IonicModule]
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
    private transactionService: TransactionService,
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

    // Payload de la Fase 1: Creación de la reserva
    const reservaPayload = {
      id_estacionamiento: this.estacionamientoId,
      fecha_reserva: this.fechaReserva,
      hora_inicio: this.horaInicio,
      hora_fin: this.horaTermino,
      monto_total: this.totalPagar
    };

    // 1. Solicitud para crear la reserva encadenada con el pago
    this.transactionService.createReservation(reservaPayload).pipe(
      switchMap((resReserva: any) => {
        if (!resReserva.ok || !resReserva.id_reserva) {
          throw new Error('FALLO_RESERVA');
        }
        
        // Payload de la Fase 2: Confirmación del Pago
        const pagoPayload = {
          id_reserva: resReserva.id_reserva,
          metodo_pago: this.metodoPagoSeleccionado
        };

        return this.transactionService.processPayment(pagoPayload);
      })
    ).subscribe({
      next: (resPago: any) => {
        this.procesando = false;
        if (resPago.ok) {
          // Todo fue exitoso, redirigimos a la pantalla de éxito
          this.router.navigate(['/reservations/success']);
        }
      },
      error: (err) => {
        this.procesando = false;
        console.error('Error en la transacción:', err);
        
        // Manejo diferenciado de errores
        if (err.status === 409) {
          alert('Este espacio ya fue reservado por otro usuario en el mismo horario. Por favor, seleccione otro.');
        } else if (err.url && err.url.includes('/payments')) {
          alert('Hubo un problema al procesar su pago, pero la reserva quedó Pendiente.');
        } else {
          alert('Ocurrió un error al intentar procesar la transacción.');
        }
      }
    });
  }
}