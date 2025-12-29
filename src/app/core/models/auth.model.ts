export interface LoginRequest {
  identificador: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  cliente: {
    id_cliente: number;
    nombre: string;
    apellido: string;
    correo_electronico: string;
    dui: string;
  };
}

export interface SolicitarActivacionRequest {
  dui: string;
}

export interface ActivarCuentaRequest {
  token: string;
  password: string;
  confirmar_password: string;
}

export interface ForgotPasswordRequest {
  identificador: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmar_password: string;
}

export interface ChangePasswordRequest {
  password_actual: string;
  password_nuevo: string;
  confirmar_password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface GenericResponse {
  message: string;
}
