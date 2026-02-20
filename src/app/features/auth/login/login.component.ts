import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  showPassword = signal(false);

  loginForm = this.fb.group({
    identificador: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authService.login(this.loginForm.value as any).subscribe({
      next: () => {
        this.loading.set(false);
        console.log('Login exitoso');
        this.router.navigate(['/portal/home']);
      },
      error: (error) => {
        this.loading.set(false);
        const message = error.error?.message || 'Error al iniciar sesión';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: message,
          confirmButtonColor: '#0d6efd'
        });
      }
    });
  }

  get f() {
    return this.loginForm.controls;
  }
}
