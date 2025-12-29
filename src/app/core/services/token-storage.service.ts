import { Injectable, signal, computed } from '@angular/core';

const ACCESS_TOKEN_KEY = 'cliente_access_token';
const REFRESH_TOKEN_KEY = 'cliente_refresh_token';
const CLIENTE_KEY = 'cliente_data';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private accessTokenSignal = signal<string | null>(this.getStoredAccessToken());
  private clienteSignal = signal<any>(this.getStoredCliente());

  readonly isAuthenticated = computed(() => !!this.accessTokenSignal());
  readonly cliente = computed(() => this.clienteSignal());
  readonly accessToken = computed(() => this.accessTokenSignal());

  private getStoredAccessToken(): string | null {
    if (typeof sessionStorage === 'undefined') return null;
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  private getStoredCliente(): any {
    if (typeof sessionStorage === 'undefined') return null;
    const data = sessionStorage.getItem(CLIENTE_KEY);
    return data ? JSON.parse(data) : null;
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    this.accessTokenSignal.set(accessToken);
  }

  saveCliente(cliente: any): void {
    sessionStorage.setItem(CLIENTE_KEY, JSON.stringify(cliente));
    this.clienteSignal.set(cliente);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getCliente(): any {
    const data = sessionStorage.getItem(CLIENTE_KEY);
    return data ? JSON.parse(data) : null;
  }

  updateAccessToken(accessToken: string): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    this.accessTokenSignal.set(accessToken);
  }

  updateRefreshToken(refreshToken: string): void {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  clear(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(CLIENTE_KEY);
    this.accessTokenSignal.set(null);
    this.clienteSignal.set(null);
  }
}
