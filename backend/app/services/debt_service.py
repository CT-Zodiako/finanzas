from sqlalchemy.orm import Session
from app.models.debt import Debt
from app.repositories.debt_repository import DebtRepository
from app.schemas.debt import DebtCreate, DebtUpdate
from decimal import Decimal
from datetime import date


class DebtService:
    def __init__(self, db: Session):
        self.repository = DebtRepository(db)

    def create(self, debt_data: DebtCreate, user_id: int) -> Debt:
        data = debt_data.model_dump()
        self._normalize_debt_data(data)
        if data.get('fecha_limite') and isinstance(data['fecha_limite'], str):
            from datetime import datetime
            data['fecha_limite'] = datetime.strptime(data['fecha_limite'], '%Y-%m-%d').date()
        
        debt = Debt(**data, user_id=user_id)
        return self.repository.create(debt)

    def get_all(self, user_id: int):
        return self.repository.get_all(user_id)

    def get_by_id(self, debt_id: int, user_id: int):
        return self.repository.get_by_id(debt_id, user_id)

    def update(self, debt_id: int, debt_data: DebtUpdate, user_id: int):
        debt = self.repository.get_by_id(debt_id, user_id)
        if not debt:
            return None
        
        update_data = debt_data.model_dump(exclude_unset=True)
        self._normalize_debt_data(update_data, debt)
        if update_data.get('fecha_limite') and isinstance(update_data['fecha_limite'], str):
            from datetime import datetime
            update_data['fecha_limite'] = datetime.strptime(update_data['fecha_limite'], '%Y-%m-%d').date()
        
        for field, value in update_data.items():
            setattr(debt, field, value)
        
        return self.repository.update(debt)

    def delete(self, debt_id: int, user_id: int):
        debt = self.repository.get_by_id(debt_id, user_id)
        if not debt:
            return False
        self.repository.delete(debt)
        return True

    def make_payment(self, debt_id: int, payment_amount: Decimal, user_id: int):
        debt = self.repository.get_by_id(debt_id, user_id)
        if not debt:
            return None
        
        new_remaining = debt.remaining_amount - payment_amount
        if new_remaining < 0:
            new_remaining = Decimal("0")
        
        debt.remaining_amount = new_remaining
        
        if new_remaining == 0:
            debt.is_active = False
        
        return self.repository.update(debt)

    def get_total_debt(self, user_id: int) -> float:
        return self.repository.get_total_debt(user_id)

    def get_summary(self, user_id: int) -> dict:
        debts = self.repository.get_active(user_id)
        saldo_actual = 0
        total_cuotas_mensuales = 0
        costo_total_todas = 0
        count = 0
        
        today = date.today()
        
        for debt in debts:
            saldo_actual += float(debt.remaining_amount)
            total_cuotas_mensuales += float(debt.monthly_payment)
            count += 1
            
            if debt.fecha_limite and debt.monthly_payment:
                fecha = debt.fecha_limite
                if isinstance(fecha, str):
                    from datetime import datetime
                    fecha = datetime.strptime(fecha, '%Y-%m-%d').date()
                
                if fecha and fecha >= today:
                    dias = (fecha - today).days
                    meses = max(1, round(dias / 30))
                    costo_total_todas += float(debt.monthly_payment) * meses
            else:
                costo_total_todas += float(debt.remaining_amount)
        
        return {
            "saldo_actual": saldo_actual,
            "total_cuotas_mensuales": total_cuotas_mensuales,
            "costo_total": costo_total_todas,
            "numero_deudas": count
        }

    def _normalize_debt_data(self, data: dict, existing: Debt | None = None) -> None:
        if not data.get('name'):
            data['name'] = existing.name if existing else 'Deuda'

        amount = data.get('amount')
        if amount is None and existing is not None:
            amount = float(existing.amount)

        if amount is None:
            return

        monto_pagado = data.pop('monto_pagado', None)
        if monto_pagado is not None:
            data['remaining_amount'] = max(0, float(amount) - float(monto_pagado))
            return

        if data.get('remaining_amount') is None and existing is None:
            data['remaining_amount'] = float(amount)
