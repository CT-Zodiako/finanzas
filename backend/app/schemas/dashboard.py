from pydantic import BaseModel
from decimal import Decimal
from typing import Optional


class DashboardSummary(BaseModel):
    total_incomes: Decimal
    total_fixed_expenses: Decimal
    total_daily_expenses: Decimal
    total_debts: Decimal
    total_debts_with_installments: Optional[Decimal] = None
    balance: Decimal
    monthly_income: Decimal


class MonthlySummary(BaseModel):
    month: str
    incomes: Decimal
    fixed_expenses: Decimal
    daily_expenses: Decimal
    balance: Decimal


class CategorySummary(BaseModel):
    category: str
    total: Decimal
    percentage: float