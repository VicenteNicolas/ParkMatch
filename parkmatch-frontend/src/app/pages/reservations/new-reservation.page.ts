import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { TransactionService } from '../../services/transaction.service';
import { LoadingController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-new-reservation',
  templateUrl: './new-reservation.page.html',
  styleUrls: ['./new-reservation.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    HttpClientModule
  ]
})
export class NewReservationPage {
  reservaData = {
    id_estacionamiento: 1, 
    fecha_reserva: new Date().toISOString(),
    hora_inicio: '',
    hora_fin: '',
    monto_total: 0
  };
  
  hoursCalculated = 0;
  precioPorHora = 3000;

  constructor(
    private transactionService: TransactionService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  calculateTotal() {
    if (!this.reservaData.hora_inicio || !this.reservaData.hora_fin) return;

    const start = new Date(this.reservaData.hora_inicio);
    const end = new Date(this.reservaData.hora_fin);
    
    let diffMs = end.getTime() - start.getTime();
    let diffHrs = diffMs / (1000 * 60 * 60);

    if (diffHrs > 0) {
      this.hoursCalculated = Math.ceil(diffHrs); 
      this.reservaData.monto_total = this.hoursCalculated * this.precioPorHora;
    } else {
      this.hoursCalculated = 0;
      this.reservaData.monto_total = 0;
    }
  }

  async confirmReservation() {
    const loading = await this.loadingCtrl.create({
      message: 'Verificando disponibilidad...',
      spinner: 'dots'
    });
    await loading.present();

    const payload = {
      ...this.reservaData,
      fecha_reserva: this.reservaData.fecha_reserva.split('T')[0],
      hora_inicio: new Date(this.reservaData.hora_inicio).toTimeString().split(' ')[0],
      hora_fin: new Date(this.reservaData.hora_fin).toTimeString().split(' ')[0]
    };

    this.transactionService.createReservation(payload).subscribe({
      next: (res) => {
        loading.dismiss();
        if (res.ok) {
          this.router.navigate(['/payment', res.id_reserva, this.reservaData.monto_total]);
        }
      },
      error: async (err) => {
        loading.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Espacio no disponible',
          message: err.error?.message || 'Ha ocurrido un error al procesar tu solicitud.',
          buttons: ['Entendido']
        });
        await alert.present();
      }
    });
  }
}