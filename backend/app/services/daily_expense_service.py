from sqlalchemy.orm import Session
from app.models.daily_expense import DailyExpense
from app.repositories.daily_expense_repository import DailyExpenseRepository
from app.schemas.daily_expense import DailyExpenseCreate, DailyExpenseUpdate
from datetime import date
from typing import Optional


class DailyExpenseService:
    def __init__(self, db: Session):
        self.repository = DailyExpenseRepository(db)

    def create(self, expense_data: DailyExpenseCreate) -> DailyExpense:
        expense = DailyExpense(**expense_data.model_dump())
        return self.repository.create(expense)

    def get_all(self):
        return self.repository.get_all()

    def get_by_id(self, expense_id: int):
        return self.repository.get_by_id(expense_id)

    def update(self, expense_id: int, expense_data: DailyExpenseUpdate):
        expense = self.repository.get_by_id(expense_id)
        if not expense:
            return None
        
        update_data = expense_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(expense, field, value)
        
        return self.repository.update(expense)

    def delete(self, expense_id: int):
        expense = self.repository.get_by_id(expense_id)
        if not expense:
            return False
        self.repository.delete(expense)
        return True

    def get_by_date_range(self, start_date: date, end_date: date):
        return self.repository.get_by_date_range(start_date, end_date)

    def get_total_daily_expenses(self, start_date: Optional[date] = None, end_date: Optional[date] = None) -> float:
        return self.repository.get_total_daily_expenses(start_date, end_date)