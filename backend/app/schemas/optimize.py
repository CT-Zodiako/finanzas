from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date


class DebtInput(BaseModel):
    nombre: str
    saldo_total: float = Field(..., ge=0)
    cuota_minima: float = Field(..., ge=0)
    tasa_interes_mensual: float = Field(..., ge=0)
    fecha_limite: date
    tipo: str = "credito"


class OptimizeInput(BaseModel):
    ingreso_mensual: float = Field(..., gt=0)
    gastos_fijos: float = Field(..., ge=0)
    ahorro_minimo: float = Field(..., ge=0)
    deudas: List[DebtInput]


class PaymentPlan(BaseModel):
    nombre: str
    pago_minimo: float
    pago_extra: float
    pago_total: float
    meses_estimados: Optional[float] = None


class OptimizeResult(BaseModel):
    estado: str
    capacidad_pago: float
    disponible: float
    extra_disponible: float
    total_cuotas_minimas: float
    carga_financiera: float
    puede_pagar_todo: bool
    payment_plan: List[PaymentPlan]
    mensajes: List[str]


class Alert(BaseModel):
    tipo: str
    nivel: str
    mensaje: str


class AlertsResult(BaseModel):
    alertas: List[Alert]
    necesita_accion: bool
