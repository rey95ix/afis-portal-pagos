export interface Cliente {
  id_cliente: number;
  dui: string;
  nombre: string;
  apellido: string;
  correo_electronico: string;
  telefono?: string;
  direccion?: string;
  cuenta_activada: boolean;
  fecha_activacion?: Date;
  ultimo_login?: Date;
}

export interface ClienteProfile {
  id_cliente: number;
  dui: string;
  nombre: string;
  apellido: string;
  correo_electronico: string;
  telefono?: string;
  direccion?: string;
  cuenta_activada: boolean;
  fecha_activacion?: string;
  ultimo_login?: string;
}

export interface ClienteSesion {
  id_sesion: number;
  dispositivo: string;
  ip_address: string;
  user_agent: string;
  fecha_creacion: string;
  ultima_actividad: string;
  es_sesion_actual: boolean;
}
