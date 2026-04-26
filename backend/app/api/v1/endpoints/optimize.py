from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.optimize_service import OptimizeService
from app.schemas.optimize import OptimizeInput, OptimizeResult, AlertsResult
from app.repositories.debt_repository import DebtRepository
from app.repositories.income_repository import IncomeRepository
from app.repositories.fixed_expense_repository import FixedExpenseRepository
from datetime import date

router = APIRouter(prefix="/optimize", tags=["Optimize"])


@router.post("/calculate", response_model=OptimizeResult)
def calculate_optimization(
    input_data: OptimizeInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = OptimizeService()
    return service.calculate(input_data)


@router.post("/from-database", response_model=OptimizeResult)
def calculate_from_database(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    income_repo = IncomeRepository(db)
    fixed_repo = FixedExpenseRepository(db)
    debt_repo = DebtRepository(db)

    incomes = income_repo.get_recurring(current_user.id)
    fixed_expenses = fixed_repo.get_active(current_user.id)
    debts = debt_repo.get_active(current_user.id)
    
    ingreso_mensual = sum(float(i.amount) for i in incomes)
    gastos_fijos = sum(float(e.amount) for e in fixed_expenses)
    
    from app.schemas.optimize import DebtInput
    
    deudas = []
    for d in debts:
        fecha = d.fecha_limite if d.fecha_limite else date.today()
        deudas.append(DebtInput(
            nombre=d.name,
            saldo_total=float(d.remaining_amount),
            cuota_minima=float(d.monthly_payment),
            tasa_interes_mensual=float(d.tasa_interes_mensual or 0),
            fecha_limite=fecha,
            tipo=d.tipo or 'credito'
        ))
    
    input_data = OptimizeInput(
        ingreso_mensual=ingreso_mensual,
        gastos_fijos=gastos_fijos,
        ahorro_minimo=0,
        deudas=deudas
    )
    
    service = OptimizeService()
    return service.calculate(input_data)


@router.post("/alerts", response_model=AlertsResult)
def get_alerts(
    input_data: OptimizeInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = OptimizeService()
    return service.get_alerts(input_data)
