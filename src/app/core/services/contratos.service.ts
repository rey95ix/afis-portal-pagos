import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';
import { ContratoResumen, ContratoDetalle, FacturaItem } from '../models';

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
}
