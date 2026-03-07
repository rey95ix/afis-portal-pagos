import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-activar-cuenta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './activar-cuenta.component.html'
})
export class ActivarCuentaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  token = signal('');

  form = this.fb.group({
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]],
    confirmar_password: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token.set(params['token']);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Token no válido',
          text: 'El enlace de activación no es válido o ha expirado.',
          confirmButtonColor: '#0d6efd'
        }).then(() => {
          this.router.navigate(['/auth/login']);
        });
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmar_password');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const data = {
      token: this.token(),
      password: this.form.value.password!,
      confirmar_password: this.form.value.confirmar_password!
    };

    this.authService.activarCuenta(data).subscribe({
      next: () => {
        this.loading.set(false);
        Swal.fire({
          icon: 'success',
          title: 'Cuenta Activada',
          text: 'Tu cuenta ha sido activada exitosamente. Ya puedes iniciar sesión.',
          confirmButtonColor: '#0d6efd'
        }).then(() => {
          this.router.navigate(['/auth/login']);
        });
      },
      error: (error) => {
        this.loading.set(false);
        const message = error.error?.message || 'Error al activar la cuenta';
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
    return this.form.controls;
  }

  get passwordValue(): string {
    return this.f['password'].value || '';
  }

  get hasMinLength(): boolean { return this.passwordValue.length >= 8; }
  get hasUppercase(): boolean { return /[A-Z]/.test(this.passwordValue); }
  get hasLowercase(): boolean { return /[a-z]/.test(this.passwordValue); }
  get hasNumber(): boolean { return /\d/.test(this.passwordValue); }
  get hasSpecialChar(): boolean { return /[@$!%*?&]/.test(this.passwordValue); }

  getPasswordStrength(): { text: string; colorClass: string; level: number } {
    const password = this.passwordValue;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return { text: 'Débil', colorClass: 'danger', level: 1 };
    if (strength <= 4) return { text: 'Media', colorClass: 'warning', level: 2 };
    return { text: 'Fuerte', colorClass: 'success', level: 3 };
  }
}
