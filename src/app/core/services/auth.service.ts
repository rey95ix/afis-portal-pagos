import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';
import {
  ApiResponse,
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
    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_URL}/login`, data).pipe(
      tap(response => {
        this.tokenStorage.saveTokens(response.data.access_token, response.data.refresh_token);
        this.tokenStorage.saveCliente(response.data.cliente);
      }),
      map(response => response.data)
    );
  }

  solicitarActivacion(data: SolicitarActivacionRequest): Observable<GenericResponse> {
    return this.http.post<ApiResponse<GenericResponse>>(`${this.API_URL}/solicitar-activacion`, data).pipe(
      map(response => response.data)
    );
  }

  activarCuenta(data: ActivarCuentaRequest): Observable<GenericResponse> {
    return this.http.post<ApiResponse<GenericResponse>>(`${this.API_URL}/activar-cuenta`, data).pipe(
      map(response => response.data)
    );
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<GenericResponse> {
    return this.http.post<ApiResponse<GenericResponse>>(`${this.API_URL}/forgot-password`, data).pipe(
      map(response => response.data)
    );
  }

  resetPassword(data: ResetPasswordRequest): Observable<GenericResponse> {
    return this.http.post<ApiResponse<GenericResponse>>(`${this.API_URL}/reset-password`, data).pipe(
      map(response => response.data)
    );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    return this.http.post<ApiResponse<RefreshTokenResponse>>(`${this.API_URL}/refresh-token`, {
      refresh_token: refreshToken
    }).pipe(
      tap(response => {
        this.tokenStorage.updateAccessToken(response.data.access_token);
        this.tokenStorage.updateRefreshToken(response.data.refresh_token);
      }),
      map(response => response.data),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<GenericResponse> {
    return this.http.post<ApiResponse<GenericResponse>>(`${this.API_URL}/logout`, {}).pipe(
      tap(() => this.clearSession()),
      map(response => response.data)
    );
  }

  logoutAll(): Observable<GenericResponse> {
    return this.http.post<ApiResponse<GenericResponse>>(`${this.API_URL}/logout-all`, {}).pipe(
      tap(() => this.clearSession()),
      map(response => response.data)
    );
  }

  getProfile(): Observable<ClienteProfile> {
    return this.http.get<ApiResponse<ClienteProfile>>(`${this.API_URL}/profile`).pipe(
      map(response => response.data)
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<GenericResponse> {
    return this.http.patch<ApiResponse<GenericResponse>>(`${this.API_URL}/change-password`, data).pipe(
      map(response => response.data)
    );
  }

  getSessions(): Observable<ClienteSesion[]> {
    return this.http.get<ApiResponse<ClienteSesion[]>>(`${this.API_URL}/sessions`).pipe(
      map(response => response.data)
    );
  }

  revokeSession(sessionId: number): Observable<GenericResponse> {
    return this.http.delete<ApiResponse<GenericResponse>>(`${this.API_URL}/sessions/${sessionId}`).pipe(
      map(response => response.data)
    );
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
