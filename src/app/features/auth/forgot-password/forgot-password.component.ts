import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loading = signal(false);
  enviado = signal(false);

  form = this.fb.group({
    identificador: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authService.forgotPassword(this.form.value as any).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.enviado.set(true);
        Swal.fire({
          icon: 'success',
          title: 'Solicitud Enviada',
          text: response.message,
          confirmButtonColor: '#1B2C56'
        });
      },
      error: (error) => {
        this.loading.set(false);
        const message = error.error?.message || 'Error al procesar la solicitud';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: message,
          confirmButtonColor: '#1B2C56'
        });
      }
    });
  }

  get f() {
    return this.form.controls;
  }
}
