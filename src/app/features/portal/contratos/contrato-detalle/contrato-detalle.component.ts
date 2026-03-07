import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContratosService } from '../../../../core/services/contratos.service';
import { ContratoDetalle, FacturaItem, PagoTarjetaResponse } from '../../../../core/models';

@Component({
  selector: 'app-contrato-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './contrato-detalle.component.html'
})
export class ContratoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private contratosService = inject(ContratosService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  error = signal(false);
  contrato = signal<ContratoDetalle | null>(null);
  facturas = signal<FacturaItem[]>([]);

  // Payment state
  selectedFacturas = signal<Set<number>>(new Set());
  showPaymentForm = signal(false);
  paymentLoading = signal(false);
  paymentResult = signal<PagoTarjetaResponse | null>(null);

  cardForm: FormGroup = this.fb.group({
    numeroTarjeta: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
    cvv2: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    mesExpiracion: ['', Validators.required],
    anioExpiracion: ['', Validators.required],
    nombreTarjetahabiente: ['', [Validators.required, Validators.maxLength(100)]],
  });

  facturasConSaldo = computed(() =>
    this.facturas().filter(f => f.saldoPendiente > 0)
  );

  totalAPagar = computed(() => {
    const selected = this.selectedFacturas();
    return this.facturas()
      .filter(f => selected.has(f.idFactura))
      .reduce((sum, f) => sum + f.saldoPendiente, 0);
  });

  selectedCount = computed(() => this.selectedFacturas().size);

  meses = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  anios: string[] = [];

  cardBrand = computed(() => {
    const num = this.cardForm?.get('numeroTarjeta')?.value || '';
    if (/^4/.test(num)) return 'VISA';
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'MC';
    return '';
  });

  ngOnInit(): void {
    const currentYear = new Date().getFullYear()-1;
    this.anios = Array.from({ length: 10 }, (_, i) => String(currentYear + i));

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

  toggleFactura(idFactura: number): void {
    const current = new Set(this.selectedFacturas());
    if (current.has(idFactura)) {
      current.delete(idFactura);
    } else {
      current.add(idFactura);
    }
    this.selectedFacturas.set(current);
  }

  isSelected(idFactura: number): boolean {
    return this.selectedFacturas().has(idFactura);
  }

  selectAllPending(): void {
    const allPending = this.facturasConSaldo().map(f => f.idFactura);
    const current = this.selectedFacturas();
    if (current.size === allPending.length) {
      this.selectedFacturas.set(new Set());
    } else {
      this.selectedFacturas.set(new Set(allPending));
    }
  }

  allPendingSelected(): boolean {
    const pending = this.facturasConSaldo();
    return pending.length > 0 && this.selectedFacturas().size === pending.length;
  }

  openPaymentForm(): void {
    this.showPaymentForm.set(true);
    this.paymentResult.set(null);
  }

  cancelPayment(): void {
    this.showPaymentForm.set(false);
    this.cardForm.reset();
  }

  submitPayment(): void {
    if (this.cardForm.invalid || this.selectedFacturas().size === 0) return;

    this.paymentLoading.set(true);
    const formValue = this.cardForm.value;
    const fechaExpiracion = `${formValue.anioExpiracion}${formValue.mesExpiracion}`;

    const idContrato = this.contrato()?.idContrato;
    if (!idContrato) return;

    this.contratosService.pagarConTarjeta(idContrato, {
      idFacturas: Array.from(this.selectedFacturas()),
      numeroTarjeta: formValue.numeroTarjeta,
      cvv2: formValue.cvv2,
      fechaExpiracion,
      nombreTarjetahabiente: formValue.nombreTarjetahabiente,
    }).subscribe({
      next: (result) => {
        this.paymentLoading.set(false);
        this.paymentResult.set(result);
        this.showPaymentForm.set(false);
        this.cardForm.reset();
        this.selectedFacturas.set(new Set());
        // Reload invoices to reflect updated balances
        this.contratosService.getFacturas(idContrato).subscribe({
          next: (data) => this.facturas.set(data),
        });
      },
      error: (err) => {
        this.paymentLoading.set(false);
        const mensaje = err?.error?.data?.message || err?.error?.message || 'Error al procesar el pago';
        this.paymentResult.set({
          exitoso: false,
          mensaje,
        });
        this.showPaymentForm.set(false);
      }
    });
  }

  dismissResult(): void {
    this.paymentResult.set(null);
  }

  formatCardDisplay(value: string): string {
    if (!value) return '';
    return value.replace(/(\d{4})(?=\d)/g, '$1 ');
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
