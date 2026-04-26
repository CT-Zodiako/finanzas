from sqlalchemy.orm import Session
from app.models.income import Income
from typing import List, Optional


class IncomeRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, income: Income) -> Income:
        self.db.add(income)
        self.db.commit()
        self.db.refresh(income)
        return income

    def get_all(self, user_id: int) -> List[Income]:
        return self.db.query(Income).filter(Income.user_id == user_id).all()

    def get_by_id(self, income_id: int, user_id: int) -> Optional[Income]:
        return self.db.query(Income).filter(Income.id == income_id, Income.user_id == user_id).first()

    def update(self, income: Income) -> Income:
        self.db.commit()
        self.db.refresh(income)
        return income

    def delete(self, income: Income) -> None:
        self.db.delete(income)
        self.db.commit()

    def get_recurring(self, user_id: int) -> List[Income]:
        return self.db.query(Income).filter(Income.user_id == user_id, Income.is_recurring == True).all()

    def get_total_income(self, user_id: int) -> float:
        result = self.db.query(Income).filter(Income.user_id == user_id).all()
        return sum(float(i.amount) for i in result)
