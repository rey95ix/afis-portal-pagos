import { Component, inject, signal, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  showPassword = signal(false);

  // Modal de migración
  @ViewChild('migrationModal') modalRef!: ElementRef;
  private modalInstance: any;
  activacionLoading = signal(false);
  activacionEnviado = signal(false);

  loginForm = this.fb.group({
    identificador: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  activacionForm = this.fb.group({
    dui: ['', [Validators.required, Validators.pattern(/^\d{8}-\d$/)]]
  });

  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(this.modalRef.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.modalInstance.show();
  }

  ngOnDestroy(): void {
    this.modalInstance?.dispose();
  }

  cerrarModal(): void {
    this.modalInstance?.hide();
  }

  onActivacionSubmit(): void {
    if (this.activacionForm.invalid) {
      this.activacionForm.markAllAsTouched();
      return;
    }

    this.activacionLoading.set(true);

    this.authService.solicitarActivacion(this.activacionForm.value as any).subscribe({
      next: (response) => {
        this.activacionLoading.set(false);
        this.activacionEnviado.set(true);
      },
      error: (error) => {
        this.activacionLoading.set(false);
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

  get fa() {
    return this.activacionForm.controls;
  }

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
        this.router.navigate(['/portal/contratos']);
      },
      error: (error) => {
        this.loading.set(false);
        const message = error.error?.message || 'Error al iniciar sesión';
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
    return this.loginForm.controls;
  }
}
