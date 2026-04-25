from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from decimal import Decimal
from typing import Optional


class DebtBase(BaseModel):
    name: str
    creditor: Optional[str] = None
    amount: Decimal
    remaining_amount: Decimal
    monthly_payment: Decimal
    tipo: Optional[str] = 'credito'
    tasa_interes_mensual: Optional[float] = None
    fecha_limite: Optional[date] = None
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)


class DebtCreate(BaseModel):
    name: Optional[str] = None
    creditor: Optional[str] = None
    amount: float
    remaining_amount: Optional[float] = None
    monto_pagado: Optional[float] = None
    monthly_payment: float
    tipo: Optional[str] = 'credito'
    tasa_interes_mensual: Optional[float] = None
    fecha_limite: Optional[str] = None


class DebtUpdate(BaseModel):
    name: Optional[str] = None
    creditor: Optional[str] = None
    amount: Optional[float] = None
    remaining_amount: Optional[float] = None
    monto_pagado: Optional[float] = None
    monthly_payment: Optional[float] = None
    tipo: Optional[str] = None
    tasa_interes_mensual: Optional[float] = None
    fecha_limite: Optional[str] = None
    is_active: Optional[bool] = None


class DebtResponse(BaseModel):
    id: int
    name: str
    creditor: Optional[str] = None
    amount: Decimal
    remaining_amount: Decimal
    monthly_payment: Decimal
    tipo: str
    tasa_interes_mensual: Optional[float] = None
    fecha_limite: Optional[date] = None
    is_active: bool = True
    meses_restantes: Optional[int] = None
    costo_total: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class DebtPayment(BaseModel):
    payment_amount: Decimal
