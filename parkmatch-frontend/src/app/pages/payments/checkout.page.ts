import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, calendarOutline, timeOutline, shieldCheckmarkOutline, 
  star, locationOutline, cardOutline, cashOutline, walletOutline, lockClosedOutline,
  chevronDownOutline, notificationsOutline, closeOutline, filterOutline, searchOutline
} from 'ionicons/icons';

interface EstacionamientoDetalle {
  nombre: string;
  direccion: string;
  imagen: string;
}

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
  estacionamiento: EstacionamientoDetalle | null = null;
  metodoPagoSeleccionado: string = 'tarjeta'; // Por defecto, Tarjeta
  procesando: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    addIcons({
      'arrow-back-outline': arrowBackOutline, 'calendar-outline': calendarOutline,
      'time-outline': timeOutline, 'shield-checkmark-outline': shieldCheckmarkOutline,
      'star': star, 'location-outline': locationOutline, 'card-outline': cardOutline,
      'cash-outline': cashOutline, 'wallet-outline': walletOutline, 'lock-closed-outline': lockClosedOutline,
      'chevron-down-outline': chevronDownOutline, 'notifications-outline': notificationsOutline,
      'close-outline': closeOutline, 'filter-outline': filterOutline, 'search-outline': searchOutline
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['total']) this.totalPagar = Number(params['total']);
      if (params['id_estacionamiento']) {
        this.estacionamientoId = Number(params['id_estacionamiento']);
        this.cargarDatosEstacionamiento(this.estacionamientoId);
      }
    });
  }

  cargarDatosEstacionamiento(id: number) {
    this.http.get<{ok: boolean, data: any[]}>('http://localhost:3000/api/parkings/available')
      .subscribe({
        next: (res) => {
          if (res.ok) {
            const encontrado = res.data.find(e => e.id === id);
            if (encontrado) {
              this.estacionamiento = {
                nombre: 'Garage Privado Cerro Alegre', // Simulado por mockup
                direccion: encontrado.direccion,
                imagen: 'assets/images/garage1.jpg'
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
    this.router.navigate(['/reservations/new'], { queryParams: { id: this.estacionamientoId } });
  }

  procesarPago() {
    this.procesando = true;
    
    // Simulamos un retraso de procesamiento bancario de 2 segundos
    setTimeout(() => {
      this.procesando = false;
      // Navegamos a la pantalla de éxito (la construiremos en el siguiente paso)
      this.router.navigate(['/reservations/success']);
    }, 2000);
  }
}