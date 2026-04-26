from sqlalchemy.orm import Session
from app.models.daily_expense import DailyExpense
from typing import List, Optional
from datetime import date


class DailyExpenseRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, expense: DailyExpense) -> DailyExpense:
        self.db.add(expense)
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def get_all(self, user_id: int) -> List[DailyExpense]:
        return self.db.query(DailyExpense).filter(DailyExpense.user_id == user_id).order_by(DailyExpense.date.desc()).all()

    def get_by_id(self, expense_id: int, user_id: int) -> Optional[DailyExpense]:
        return self.db.query(DailyExpense).filter(DailyExpense.id == expense_id, DailyExpense.user_id == user_id).first()

    def update(self, expense: DailyExpense) -> DailyExpense:
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def delete(self, expense: DailyExpense) -> None:
        self.db.delete(expense)
        self.db.commit()

    def get_by_date_range(self, user_id: int, start_date: date, end_date: date) -> List[DailyExpense]:
        return self.db.query(DailyExpense).filter(
            DailyExpense.user_id == user_id,
            DailyExpense.date >= start_date,
            DailyExpense.date <= end_date
        ).all()

    def get_total_daily_expenses(self, user_id: int, start_date: Optional[date] = None, end_date: Optional[date] = None) -> float:
        query = self.db.query(DailyExpense).filter(DailyExpense.user_id == user_id)
        if start_date and end_date:
            query = query.filter(
                DailyExpense.date >= start_date,
                DailyExpense.date <= end_date
            )
        result = query.all()
        return sum(float(e.amount) for e in result)
