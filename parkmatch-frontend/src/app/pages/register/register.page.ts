import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, eyeOutline, logoGoogle, logoApple } from 'ionicons/icons';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule
  ]
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;

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
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rut: ['', [Validators.required, this.rutValidator]],
      telefono: ['', [Validators.pattern(/^\+?56\d{9}$|^9\d{8}$/)]],
      tipo_usuario: ['Conductor', [Validators.required]]
    });
  }

  rutValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;
    
    const cleanRut = value.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    if (cleanRut.length < 8 || cleanRut.length > 9) return { 'invalidRut': true };
    
    const cuerpo = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);
    
    if (!/^\d+$/.test(cuerpo)) return { 'invalidRut': true };
    
    let suma = 0;
    let multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += multiplo * parseInt(cuerpo.charAt(i));
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    
    const dvEsperado = 11 - (suma % 11);
    const dvString = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    
    return dv === dvString ? null : { 'invalidRut': true };
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;

    const loading = await this.loadingCtrl.create({
      message: 'Creando cuenta de confianza...',
      spinner: 'crescent'
    });
    await loading.present();

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        loading.dismiss();
        if (res.ok) {
          this.showSuccessAlert('Registro Exitoso', 'Tu perfil en ParkMatch ha sido creado de forma segura.');
        }
      },
      error: (err) => {
        loading.dismiss();
        const msg = err.error?.message || 'Error al procesar el registro.';
        this.showErrorAlert('Error en el Registro', msg);
      }
    });
  }

  async showSuccessAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [{
        text: 'Comenzar',
        handler: () => { this.router.navigate(['/home']); }
      }]
    });
    await alert.present();
  }

  async showErrorAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['Entendido'] });
    await alert.present();
  }
}