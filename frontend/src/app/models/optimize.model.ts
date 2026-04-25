export interface DebtOptimize {
  nombre: string;
  saldo_total: number | string;
  cuota_minima: number | string;
  tasa_interes_mensual: number | string;
  fecha_limite: string;
  tipo: string;
}

export interface OptimizeInput {
  ingreso_mensual: number;
  gastos_fijos: number;
  ahorro_minimo: number;
  deudas: DebtOptimize[];
}

export interface PaymentPlan {
  nombre: string;
  pago_minimo: number;
  pago_extra: number;
  pago_total: number;
  meses_estimados?: number;
}

export interface OptimizeResult {
  estado: string;
  capacidad_pago: number;
  disponible: number;
  extra_disponible: number;
  total_cuotas_minimas: number;
  carga_financiera: number;
  puede_pagar_todo: boolean;
  payment_plan: PaymentPlan[];
  mensajes: string[];
}

export interface Alert {
  tipo: string;
  nivel: string;
  mensaje: string;
}

export interface AlertsResult {
  alertas: Alert[];
  necesita_accion: boolean;
}
