import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContratosService } from '../../../../core/services/contratos.service';
import { FacturaDetalle } from '../../../../core/models';

@Component({
  selector: 'app-factura-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './factura-detalle.component.html',
})
export class FacturaDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contratosService = inject(ContratosService);

  loading = signal(true);
  error = signal(false);
  factura = signal<FacturaDetalle | null>(null);
  idContrato = signal<number>(0);
  downloadingPdf = signal(false);

  ngOnInit(): void {
    const idContrato = Number(this.route.snapshot.paramMap.get('id'));
    const idFactura = Number(this.route.snapshot.paramMap.get('idFactura'));

    if (!idContrato || !idFactura) {
      this.router.navigate(['/portal/contratos']);
      return;
    }

    this.idContrato.set(idContrato);
    this.loadFactura(idContrato, idFactura);
  }

  loadFactura(idContrato: number, idFactura: number): void {
    this.loading.set(true);
    this.error.set(false);

    this.contratosService.getFacturaDetalle(idContrato, idFactura).subscribe({
      next: (data) => {
        this.factura.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  canDownloadPdf(): boolean {
    const f = this.factura();
    if (!f) return false;
    return f.estado === 'ACTIVO' &&
      ['PROCESADO', 'FIRMADO', 'TRANSMITIDO'].includes(f.estadoDte);
  }

  descargarPdf(): void {
    const f = this.factura();
    if (!f || this.downloadingPdf()) return;
    this.downloadingPdf.set(true);
    this.contratosService.descargarFacturaPdf(
      this.idContrato(),
      f.idFactura,
      f.numeroFactura,
    );
    // Liberar el estado tras un pequeño delay (la request es async, pero el botón debe re-habilitarse)
    setTimeout(() => this.downloadingPdf.set(false), 2000);
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

  getEstadoDteBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      'PROCESADO': 'portal-servicio-badge--activo',
      'FIRMADO': 'portal-servicio-badge--default',
      'BORRADOR': 'portal-servicio-badge--default',
      'RECHAZADO': 'portal-servicio-badge--mora',
      'INVALIDADO': 'portal-servicio-badge--mora',
      'TRANSMITIDO': 'portal-servicio-badge--activo',
      'CONTINGENCIA': 'portal-servicio-badge--warning',
    };
    return map[estado] || 'portal-servicio-badge--default';
  }

  getCondicionOperacionNombre(condicion: number): string {
    const map: Record<number, string> = {
      1: 'Contado',
      2: 'Crédito',
      3: 'Otro',
    };
    return map[condicion] || 'Desconocido';
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatDateTime(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-SV', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
