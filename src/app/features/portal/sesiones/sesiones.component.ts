import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ClienteSesion } from '../../../core/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sesiones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sesiones.component.html'
})
export class SesionesComponent implements OnInit {
  private authService = inject(AuthService);

  loading = signal(true);
  sessions = signal<ClienteSesion[]>([]);

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading.set(true);
    this.authService.getSessions().subscribe({
      next: (data) => {
        this.sessions.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  revokeSession(session: ClienteSesion): void {
    if (session.es_sesion_actual) {
      Swal.fire({
        icon: 'warning',
        title: 'No puedes revocar tu sesión actual',
        text: 'Si deseas cerrar esta sesión, usa el botón "Cerrar Sesión".',
        confirmButtonColor: '#1B2C56'
      });
      return;
    }

    Swal.fire({
      title: '¿Revocar esta sesión?',
      text: `Se cerrará la sesión en: ${session.dispositivo}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, revocar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.revokeSession(session.id_sesion).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Sesión Revocada',
              text: 'La sesión ha sido cerrada exitosamente.',
              confirmButtonColor: '#1B2C56'
            });
            this.loadSessions();
          },
          error: (error) => {
            const message = error.error?.message || 'Error al revocar la sesión';
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: message,
              confirmButtonColor: '#1B2C56'
            });
          }
        });
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDeviceIcon(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'bi-phone';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'bi-tablet';
    }
    return 'bi-laptop';
  }
}
