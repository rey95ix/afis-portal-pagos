import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContratosService } from '../../../core/services/contratos.service';
import { ContratoResumen } from '../../../core/models';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contratos.component.html'
})
export class ContratosComponent implements OnInit {
  private contratosService = inject(ContratosService);

  loading = signal(true);
  error = signal(false);
  contratos = signal<ContratoResumen[]>([]);

  ngOnInit(): void {
    this.loadContratos();
  }

  loadContratos(): void {
    this.loading.set(true);
    this.error.set(false);
    this.contratosService.getContratos().subscribe({
      next: (data) => {
        this.contratos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  getServicioBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      'ACTIVO': 'portal-servicio-badge--activo',
      'INSTALADO_ACTIVO': 'portal-servicio-badge--activo',
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
