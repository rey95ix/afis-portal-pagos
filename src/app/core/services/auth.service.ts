import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';
import {
  LoginRequest,
  LoginResponse,
  SolicitarActivacionRequest,
  ActivarCuentaRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  RefreshTokenResponse,
  GenericResponse
} from '../models';
import { ClienteProfile, ClienteSesion } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenStorage = inject(TokenStorageService);

  private readonly API_URL = `${environment.apiUrl}/cliente-auth`;

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, data).pipe(
      tap(response => {
        this.tokenStorage.saveTokens(response.access_token, response.refresh_token);
        this.tokenStorage.saveCliente(response.cliente);
      })
    );
  }

  solicitarActivacion(data: SolicitarActivacionRequest): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.API_URL}/solicitar-activacion`, data);
  }

  activarCuenta(data: ActivarCuentaRequest): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.API_URL}/activar-cuenta`, data);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.API_URL}/forgot-password`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.API_URL}/reset-password`, data);
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    return this.http.post<RefreshTokenResponse>(`${this.API_URL}/refresh-token`, {
      refresh_token: refreshToken
    }).pipe(
      tap(response => {
        this.tokenStorage.updateAccessToken(response.access_token);
        this.tokenStorage.updateRefreshToken(response.refresh_token);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.API_URL}/logout`, {}).pipe(
      tap(() => this.clearSession())
    );
  }

  logoutAll(): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.API_URL}/logout-all`, {}).pipe(
      tap(() => this.clearSession())
    );
  }

  getProfile(): Observable<ClienteProfile> {
    return this.http.get<ClienteProfile>(`${this.API_URL}/profile`);
  }

  changePassword(data: ChangePasswordRequest): Observable<GenericResponse> {
    return this.http.patch<GenericResponse>(`${this.API_URL}/change-password`, data);
  }

  getSessions(): Observable<ClienteSesion[]> {
    return this.http.get<ClienteSesion[]>(`${this.API_URL}/sessions`);
  }

  revokeSession(sessionId: number): Observable<GenericResponse> {
    return this.http.delete<GenericResponse>(`${this.API_URL}/sessions/${sessionId}`);
  }

  clearSession(): void {
    this.tokenStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return this.tokenStorage.isAuthenticated();
  }

  getCliente() {
    return this.tokenStorage.cliente;
  }
}
