from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import date
from app.repositories.debt_repository import DebtRepository
from app.repositories.income_repository import IncomeRepository
from app.repositories.fixed_expense_repository import FixedExpenseRepository
from app.repositories.daily_expense_repository import DailyExpenseRepository
from app.schemas.dashboard import DashboardSummary, CategorySummary
from typing import List


class DashboardService:
    def __init__(self, db: Session):
        self.debt_repo = DebtRepository(db)
        self.income_repo = IncomeRepository(db)
        self.fixed_expense_repo = FixedExpenseRepository(db)
        self.daily_expense_repo = DailyExpenseRepository(db)

    def get_summary(self, user_id: int) -> DashboardSummary:
        total_incomes = Decimal(str(self.income_repo.get_total_income(user_id)))
        total_fixed_expenses = Decimal(str(self.fixed_expense_repo.get_total_fixed_expenses(user_id)))
        
        today = date.today()
        start_of_month = today.replace(day=1)
        total_daily_expenses = Decimal(str(
            self.daily_expense_repo.get_total_daily_expenses(user_id, start_of_month, today)
        ))

        from app.services.debt_service import DebtService as DebtSvc
        debt_service = DebtSvc(self.debt_repo.db)
        debt_summary = debt_service.get_summary(user_id)
        
        total_debts = Decimal(str(debt_summary["saldo_actual"]))
        total_debts_with_installments = Decimal(str(debt_summary.get("costo_total", debt_summary["saldo_actual"])))
        
        monthly_income = total_incomes
        balance = monthly_income - total_fixed_expenses - total_daily_expenses - total_debts
        
        return DashboardSummary(
            total_incomes=total_incomes,
            total_fixed_expenses=total_fixed_expenses,
            total_daily_expenses=total_daily_expenses,
            total_debts=total_debts,
            total_debts_with_installments=total_debts_with_installments,
            balance=balance,
            monthly_income=monthly_income
        )

    def get_category_expenses(self, user_id: int) -> List[CategorySummary]:
        daily_expenses = self.daily_expense_repo.get_all(user_id)
        total = sum(float(e.amount) for e in daily_expenses)
        
        category_totals = {}
        for expense in daily_expenses:
            cat = expense.category or "Otros"
            category_totals[cat] = category_totals.get(cat, 0) + float(expense.amount)
        
        results = []
        for cat, total_amount in category_totals.items():
            percentage = (total_amount / total * 100) if total > 0 else 0
            results.append(CategorySummary(
                category=cat,
                total=Decimal(str(total_amount)),
                percentage=round(percentage, 2)
            ))
        
        return sorted(results, key=lambda x: x.total, reverse=True)
