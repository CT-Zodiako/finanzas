from app.models.debt import Debt
from app.schemas.debt import DebtResponse
from datetime import datetime, date


class DebtMapper:
    @staticmethod
    def to_response(debt: Debt) -> DebtResponse:
        fecha_limite = None
        meses_restantes = None
        costo_total = None
        
        if debt.fecha_limite:
            if isinstance(debt.fecha_limite, str):
                fecha_limite = datetime.strptime(debt.fecha_limite, '%Y-%m-%d').date()
            else:
                fecha_limite = debt.fecha_limite
            
            if fecha_limite and fecha_limite >= date.today():
                dias_restantes = (fecha_limite - date.today()).days
                meses_restantes = max(1, round(dias_restantes / 30))
                
                if debt.monthly_payment and meses_restantes:
                    costo_total = float(debt.monthly_payment) * meses_restantes

        return DebtResponse(
            id=debt.id,
            name=debt.name,
            creditor=debt.creditor,
            amount=debt.amount,
            remaining_amount=debt.remaining_amount,
            monthly_payment=debt.monthly_payment,
            tipo=debt.tipo or 'credito',
            tasa_interes_mensual=debt.tasa_interes_mensual,
            fecha_limite=fecha_limite,
            is_active=debt.is_active,
            meses_restantes=meses_restantes,
            costo_total=costo_total
        )
