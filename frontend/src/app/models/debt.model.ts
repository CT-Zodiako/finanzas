export interface Debt {
  id?: number;
  name: string;
  creditor?: string;
  amount: number | string;
  remaining_amount: number | string;
  monto_pagado?: number;
  monthly_payment: number | string;
  tipo: 'tarjeta' | 'credito' | 'personal';
  tasa_interes_mensual?: number;
  fecha_limite?: string;
  is_active: boolean;
  meses_restantes?: number;
  costo_total?: number;
}

export interface DebtCreate {
  name?: string;
  creditor?: string;
  amount: number;
  remaining_amount?: number;
  monto_pagado?: number;
  monthly_payment: number;
  tipo?: 'tarjeta' | 'credito' | 'personal';
  tasa_interes_mensual?: number;
  fecha_limite?: string;
}

export interface DebtUpdate {
  name?: string;
  creditor?: string;
  amount?: number;
  remaining_amount?: number;
  monto_pagado?: number;
  monthly_payment?: number;
  tipo?: 'tarjeta' | 'credito' | 'personal';
  tasa_interes_mensual?: number;
  fecha_limite?: string;
  is_active?: boolean;
}

export interface DebtPayment {
  payment_amount: number;
}

export interface DebtSummary {
  saldo_actual: number;
  total_cuotas_mensuales: number;
  costo_total: number;
  numero_deudas: number;
}
