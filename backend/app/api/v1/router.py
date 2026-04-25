from fastapi import APIRouter
from app.api.v1.endpoints import (
    debts,
    incomes,
    fixed_expenses,
    daily_expenses,
    dashboard,
    budget,
    optimize
)

api_router = APIRouter(prefix="/v1")

api_router.include_router(debts.router)
api_router.include_router(incomes.router)
api_router.include_router(fixed_expenses.router)
api_router.include_router(daily_expenses.router)
api_router.include_router(dashboard.router)
api_router.include_router(budget.router)
api_router.include_router(optimize.router)