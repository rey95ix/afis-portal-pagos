import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './portal-layout.component.html'
})
export class PortalLayoutComponent {
  private authService = inject(AuthService);
  private tokenStorage = inject(TokenStorageService);
  year = new Date().getFullYear();
  cliente = this.tokenStorage.cliente;
  isMenuOpen = signal(false);

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  logout(): void {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas cerrar tu sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1B2C56',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout().subscribe({
          next: () => {
            // La redirección se maneja en el servicio
          },
          error: () => {
            // En caso de error, también limpiamos la sesión localmente
            this.authService.clearSession();
          }
        });
      }
    });
  }

  logoutAll(): void {
    Swal.fire({
      title: '¿Cerrar todas las sesiones?',
      text: 'Esto cerrará la sesión en todos tus dispositivos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cerrar todas',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logoutAll().subscribe({
          next: () => {
            // La redirección se maneja en el servicio
          },
          error: () => {
            this.authService.clearSession();
          }
        });
      }
    });
  }
}
