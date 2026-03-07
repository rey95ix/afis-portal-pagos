import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { ContratosService } from '../../../core/services/contratos.service';
import { ContratoResumen } from '../../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private tokenStorage = inject(TokenStorageService);
  private contratosService = inject(ContratosService);

  cliente = this.tokenStorage.cliente;
  contratos = signal<ContratoResumen[]>([]);
  contratosLoading = signal(true);

  get inicialNombre(): string {
    return this.cliente()?.nombre?.charAt(0)?.toUpperCase() || '?';
  }

  ngOnInit(): void {
    this.contratosService.getContratos().subscribe({
      next: (data) => {
        this.contratos.set(data);
        this.contratosLoading.set(false);
      },
      error: () => {
        this.contratosLoading.set(false);
      }
    });
  }

  get contratosActivos(): number {
    return this.contratos().filter(c => c.estado === 'ACTIVO').length;
  }

  getServicioBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      'ACTIVO': 'portal-servicio-badge--activo',
      'EN_MORA': 'portal-servicio-badge--mora',
      'REDUCIDO': 'portal-servicio-badge--warning',
      'SUSPENDIDO': 'portal-servicio-badge--default',
    };
    return map[estado] || 'portal-servicio-badge--default';
  }

  formatEstado(estado: string): string {
    return estado.replace(/_/g, ' ');
  }
}
