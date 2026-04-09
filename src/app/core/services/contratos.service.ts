import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';
import { ContratoResumen, ContratoDetalle, FacturaItem, FacturaDetalle, PagoTarjetaRequest, PagoTarjetaResponse, PagoIntentResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ContratosService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/cliente-portal`;

  getContratos(): Observable<ContratoResumen[]> {
    return this.http.get<ApiResponse<ApiResponse<ContratoResumen[]>>>(`${this.API_URL}/contratos`).pipe(
      map(response => response.data.data)
    );
  }

  getContrato(id: number): Observable<ContratoDetalle> {
    return this.http.get<ApiResponse<ApiResponse<ContratoDetalle>>>(`${this.API_URL}/contratos/${id}`).pipe(
      map(response => response.data.data)
    );
  }

  getFacturas(idContrato: number): Observable<FacturaItem[]> {
    return this.http.get<ApiResponse<ApiResponse<FacturaItem[]>>>(`${this.API_URL}/contratos/${idContrato}/facturas`).pipe(
      map(response => response.data.data)
    );
  }

  getFacturaDetalle(idContrato: number, idFactura: number): Observable<FacturaDetalle> {
    return this.http.get<ApiResponse<ApiResponse<FacturaDetalle>>>(
      `${this.API_URL}/contratos/${idContrato}/facturas/${idFactura}`
    ).pipe(
      map(response => response.data.data)
    );
  }

  descargarFacturaPdf(idContrato: number, idFactura: number, numeroFactura: string | null): void {
    this.http.get(
      `${this.API_URL}/contratos/${idContrato}/facturas/${idFactura}/pdf`,
      { responseType: 'blob', observe: 'response' }
    ).subscribe({
      next: (response) => {
        const blob = new Blob([response.body!], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');

        if (!newWindow) {
          const link = document.createElement('a');
          link.href = url;
          link.download = `DTE_${numeroFactura || idFactura}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      },
      error: (error) => {
        console.error('Error al descargar PDF:', error);
      }
    });
  }

  crearPagoIntent(idContrato: number, idFactura: number, monto: number): Observable<PagoIntentResponse> {
    return this.http.post<ApiResponse<ApiResponse<PagoIntentResponse>>>(
      `${this.API_URL}/contratos/${idContrato}/pago-intent`,
      { idFactura, monto },
    ).pipe(
      map(response => response.data.data)
    );
  }

  pagarConTarjeta(idContrato: number, payload: PagoTarjetaRequest): Observable<PagoTarjetaResponse> {
    return this.http.post<ApiResponse<ApiResponse<PagoTarjetaResponse>>>(
      `${this.API_URL}/contratos/${idContrato}/pago-tarjeta`,
      payload,
    ).pipe(
      map(response => response.data.data)
    );
  }
}
