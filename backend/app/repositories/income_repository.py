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

    def get_all(self) -> List[Income]:
        return self.db.query(Income).all()

    def get_by_id(self, income_id: int) -> Optional[Income]:
        return self.db.query(Income).filter(Income.id == income_id).first()

    def update(self, income: Income) -> Income:
        self.db.commit()
        self.db.refresh(income)
        return income

    def delete(self, income: Income) -> None:
        self.db.delete(income)
        self.db.commit()

    def get_recurring(self) -> List[Income]:
        return self.db.query(Income).filter(Income.is_recurring == True).all()

    def get_total_income(self) -> float:
        result = self.db.query(Income).all()
        return sum(float(i.amount) for i in result)