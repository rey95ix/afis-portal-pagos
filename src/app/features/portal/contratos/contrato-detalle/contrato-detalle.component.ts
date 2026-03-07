import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContratosService } from '../../../../core/services/contratos.service';
import { ContratoDetalle, FacturaItem } from '../../../../core/models';

@Component({
  selector: 'app-contrato-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contrato-detalle.component.html'
})
export class ContratoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private contratosService = inject(ContratosService);

  loading = signal(true);
  error = signal(false);
  contrato = signal<ContratoDetalle | null>(null);
  facturas = signal<FacturaItem[]>([]);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData(id);
  }

  loadData(id: number): void {
    this.loading.set(true);
    this.error.set(false);

    let loadedCount = 0;
    const checkDone = () => {
      loadedCount++;
      if (loadedCount >= 2) this.loading.set(false);
    };

    this.contratosService.getContrato(id).subscribe({
      next: (data) => {
        this.contrato.set(data);
        checkDone();
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });

    this.contratosService.getFacturas(id).subscribe({
      next: (data) => {
        this.facturas.set(data);
        checkDone();
      },
      error: () => {
        checkDone();
      }
    });
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

  getEstadoPagoBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      'PAGADO': 'portal-servicio-badge--activo',
      'PENDIENTE': 'portal-servicio-badge--warning',
      'PARCIAL': 'portal-servicio-badge--default',
      'VENCIDA': 'portal-servicio-badge--mora',
      'EN_ACUERDO': 'portal-servicio-badge--warning',
    };
    return map[estado] || 'portal-servicio-badge--default';
  }

  getFacturaCardClass(estadoPago: string): string {
    const map: Record<string, string> = {
      'PAGADO': 'factura-card--pagado',
      'PENDIENTE': 'factura-card--pendiente',
      'VENCIDA': 'factura-card--vencida',
      'PARCIAL': 'factura-card--parcial',
    };
    return map[estadoPago] || '';
  }

  formatEstado(estado: string): string {
    return estado.replace(/_/g, ' ');
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatPeriodo(inicio: string | null, fin: string | null): string {
    if (!inicio || !fin) return '-';
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const i = new Date(inicio).toLocaleDateString('es-SV', opts);
    const f = new Date(fin).toLocaleDateString('es-SV', opts);
    return `${i} - ${f}`;
  }
}
