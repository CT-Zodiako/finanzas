from sqlalchemy.orm import Session
from app.models.debt import Debt
from typing import List, Optional


class DebtRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, debt: Debt) -> Debt:
        self.db.add(debt)
        self.db.commit()
        self.db.refresh(debt)
        return debt

    def get_all(self) -> List[Debt]:
        return self.db.query(Debt).all()

    def get_by_id(self, debt_id: int) -> Optional[Debt]:
        return self.db.query(Debt).filter(Debt.id == debt_id).first()

    def update(self, debt: Debt) -> Debt:
        self.db.commit()
        self.db.refresh(debt)
        return debt

    def delete(self, debt: Debt) -> None:
        self.db.delete(debt)
        self.db.commit()

    def get_active(self) -> List[Debt]:
        return self.db.query(Debt).filter(Debt.is_active == True).all()

    def get_total_debt(self) -> float:
        result = self.db.query(Debt).filter(Debt.is_active == True).all()
        return sum(float(d.remaining_amount) for d in result)