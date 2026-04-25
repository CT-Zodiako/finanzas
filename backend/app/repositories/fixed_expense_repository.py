from sqlalchemy.orm import Session
from app.models.fixed_expense import FixedExpense
from typing import List, Optional


class FixedExpenseRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, expense: FixedExpense) -> FixedExpense:
        self.db.add(expense)
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def get_all(self) -> List[FixedExpense]:
        return self.db.query(FixedExpense).all()

    def get_by_id(self, expense_id: int) -> Optional[FixedExpense]:
        return self.db.query(FixedExpense).filter(FixedExpense.id == expense_id).first()

    def update(self, expense: FixedExpense) -> FixedExpense:
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def delete(self, expense: FixedExpense) -> None:
        self.db.delete(expense)
        self.db.commit()

    def get_active(self) -> List[FixedExpense]:
        return self.db.query(FixedExpense).filter(FixedExpense.is_active == True).all()

    def get_total_fixed_expenses(self) -> float:
        result = self.db.query(FixedExpense).filter(FixedExpense.is_active == True).all()
        return sum(float(e.amount) for e in result)