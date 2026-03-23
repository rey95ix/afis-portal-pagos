import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirmaContratoService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/firma-contrato`;

  validarToken(token: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${token}/validar`);
  }

  obtenerPdf(token: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${token}/pdf`, {
      responseType: 'blob'
    });
  }

  firmar(token: string, firmaBase64: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${token}/firmar`, {
      firma_base64: firmaBase64
    });
  }
}
