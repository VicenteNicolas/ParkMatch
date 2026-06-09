import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, eyeOutline, logoGoogle, logoApple } from 'ionicons/icons';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    HttpClientModule
  ]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({
        'mail-outline': mailOutline,
        'lock-closed-outline': lockClosedOutline,
        'eye-outline': eyeOutline,
        'logo-google': logoGoogle,
        'logo-apple': logoApple
    });
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    const loading = await this.loadingCtrl.create({
      message: 'Ingresando a ParkMatch...',
      spinner: 'crescent'
    });
    await loading.present();

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        loading.dismiss();
        if (res.ok) {
          this.router.navigate(['/landing']);
        }
      },
      error: (err) => {
        loading.dismiss();
        const msg = err.error?.message || 'Error de conexión con el servidor.';
        this.showAlert('Error de Ingreso', msg);
      }
    });
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['Aceptar']
    });
    await alert.present();
  }
}