import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FirmaContratoService } from '../../core/services/firma-contrato.service';
import SignaturePad from 'signature_pad';

type ViewState = 'loading' | 'error' | 'ready' | 'signing' | 'success';

@Component({
  selector: 'app-firmar-contrato',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './firmar-contrato.component.html',
  styleUrl: './firmar-contrato.component.css',
})
export class FirmarContratoComponent implements OnInit, OnDestroy, AfterViewInit {
  private route = inject(ActivatedRoute);
  private firmaService = inject(FirmaContratoService);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;

  state = signal<ViewState>('loading');
  errorMessage = signal('');
  contrato = signal<any>(null);
  pdfUrl = signal<string | null>(null);
  pdfError = signal(false);
  hasFirma = signal(false);
  safePdfUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.pdfUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
  token = '';
  private signaturePad: SignaturePad | null = null;
  private resizeObserver: ResizeObserver | null = null;

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.state.set('error');
      this.errorMessage.set('El enlace de firma no es válido.');
      return;
    }

    this.firmaService.validarToken(this.token).subscribe({
      next: (response) => {
        const data = response.data || response;
        this.contrato.set(data.contrato);
        this.state.set('ready');
        this.cargarPdf();
        // Wait for DOM to render the canvas, then init signature pad
        setTimeout(() => this.initSignaturePad(), 0);
      },
      error: (error) => {
        this.state.set('error');
        this.errorMessage.set(
          error.error?.message || 'El enlace de firma no es válido o ha expirado.'
        );
      },
    });
  }

  ngAfterViewInit(): void {
    // Signature pad is initialized reactively when state transitions to 'ready'
  }

  ngOnDestroy(): void {
    if (this.pdfUrl()) {
      URL.revokeObjectURL(this.pdfUrl()!);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private cargarPdf(): void {
    this.firmaService.obtenerPdf(this.token).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.pdfUrl.set(url);
      },
      error: () => {
        this.pdfError.set(true);
      },
    });
  }

  private initSignaturePad(): void {
    if (!this.signatureCanvas?.nativeElement) return;

    const canvas = this.signatureCanvas.nativeElement;
    this.resizeCanvas(canvas);
    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
    });
    this.signaturePad.addEventListener('endStroke', () => {
      this.hasFirma.set(true);
    });

    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas(canvas);
    });
    this.resizeObserver.observe(canvas.parentElement!);
  }

  private resizeCanvas(canvas: HTMLCanvasElement): void {
    const parent = canvas.parentElement;
    if (!parent) return;
    const ratio = window.devicePixelRatio || 1;
    const width = parent.clientWidth;
    const height = window.innerWidth >= 576 ? 200 : 150;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(ratio, ratio);
    }
    if (this.signaturePad) {
      this.signaturePad.clear();
      this.hasFirma.set(false);
    }
  }

  verPdf(): void {
    const url = this.pdfUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }

  limpiarFirma(): void {
    this.signaturePad?.clear();
    this.hasFirma.set(false);
  }

  firmar(): void {
    if (!this.signaturePad || !this.hasFirma()) {
      return;
    }

    this.state.set('signing');
    const firmaBase64 = this.signaturePad.toDataURL('image/png');

    this.firmaService.firmar(this.token, firmaBase64).subscribe({
      next: () => {
        this.state.set('success');
      },
      error: (error) => {
        this.state.set('ready');
        this.errorMessage.set(
          error.error?.message || 'Error al procesar la firma. Intente de nuevo.'
        );
        // Re-init signature pad
        setTimeout(() => this.initSignaturePad(), 100);
      },
    });
  }

}
