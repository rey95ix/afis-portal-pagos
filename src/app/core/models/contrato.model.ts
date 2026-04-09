export interface ContratoResumen {
  idContrato: number;
  codigo: string;
  estado: string;
  fechaInicioContrato: string | null;
  fechaFinContrato: string | null;
  mesesContrato: number;
  costoInstalacion: number | null;
  plan: {
    nombre: string;
    precio: number;
    velocidadBajada: number | null;
    velocidadSubida: number | null;
    tipoServicio: string;
  };
  ciclo: {
    nombre: string;
    diaCorte: number;
    diaVencimiento: number;
  };
}

export interface ContratoDetalle {
  idContrato: number;
  codigo: string;
  estado: string;
  fechaVenta: string | null;
  fechaInstalacion: string | null;
  fechaInicioContrato: string | null;
  fechaFinContrato: string | null;
  mesesContrato: number;
  costoInstalacion: number | null;
  plan: {
    nombre: string;
    precio: number;
    velocidadBajada: number | null;
    velocidadSubida: number | null;
    tipoPlan: string;
    tipoServicio: string;
  };
  cliente:{
    titular: string;
  };
  ciclo: {
    nombre: string;
    diaCorte: number;
    diaVencimiento: number;
  };
  instalacion: {
    wifiNombre: string | null;
    instalado: boolean;
    fechaInstalacion: string | null;
  } | null;
  direccionServicio: {
    direccion: string;
    colonia: string | null;
    municipio: string | null;
    departamento: string | null;
  };
}

export interface FacturaItem {
  idFactura: number;
  numeroCuota: number | null;
  totalCuotas: number | null;
  periodoInicio: string | null;
  periodoFin: string | null;
  fechaVencimiento: string | null;
  total: number;
  montoMora: number;
  montoAbonado: number;
  saldoPendiente: number;
  estadoPago: string;
  estadoDte: string;
  esInstalacion: boolean;
  numeroFactura: string | null;
  estado: string;
}

export interface FacturaDetalleItem {
  idDetalle: number;
  numItem: number;
  codigo: string | null;
  nombre: string;
  descripcion: string | null;
  cantidad: number;
  precioUnitario: number;
  ventaGravada: number;
  ventaExenta: number;
  ventaNoSujeto: number;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
}

export interface FacturaDetalle {
  idFactura: number;
  numeroFactura: string | null;
  fechaCreacion: string;

  clienteNombre: string | null;
  clienteNit: string | null;
  clienteNrc: string | null;
  clienteDireccion: string | null;
  clienteTelefono: string | null;
  clienteCorreo: string | null;

  subtotal: number;
  descuento: number;
  totalGravada: number;
  totalExenta: number;
  totalNoSuj: number;
  iva: number;
  total: number;
  totalLetras: string | null;

  condicionOperacion: number;
  metodoPago: string | null;

  tipoFactura: string | null;
  tipoFacturaCodigo: string | null;
  estadoDte: string;
  codigoGeneracion: string | null;
  numeroControl: string | null;
  selloRecepcion: string | null;
  fechaRecepcionMh: string | null;

  estado: string;
  estadoPago: string;
  montoAbonado: number;
  saldoPendiente: number;

  numeroCuota: number | null;
  totalCuotas: number | null;
  periodoInicio: string | null;
  periodoFin: string | null;
  fechaVencimiento: string | null;
  esInstalacion: boolean;
  montoMora: number;

  detalles: FacturaDetalleItem[];
}

export interface PagoTarjetaRequest {
  tokenPago: string;
  idFactura: number;
  monto: number;
  numeroTarjeta: string;
  cvv2: string;
  fechaExpiracion: string;
  nombreTarjetahabiente: string;
}

export interface PagoIntentResponse {
  token: string;
  montoEsperado: number;
  expiraEn: number; // minutos
}

export interface PagoTarjetaResponse {
  exitoso: boolean;
  mensaje: string;
  numeroAutorizacion?: string;
  terminacionTarjeta?: string;
  fechaTransaccion?: string;
  distribucion?: {
    items: Array<{
      idFactura: number;
      cuota: number | null;
      montoAplicado: number;
      estadoResultante: string;
    }>;
    montoTotal: number;
    montoDistribuido: number;
  };
}
