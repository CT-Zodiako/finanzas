from sqlalchemy.orm import Session
from app.models.income import Income
from app.repositories.income_repository import IncomeRepository
from app.schemas.income import IncomeCreate, IncomeUpdate


class IncomeService:
    def __init__(self, db: Session):
        self.repository = IncomeRepository(db)

    def create(self, income_data: IncomeCreate) -> Income:
        income = Income(**income_data.model_dump())
        return self.repository.create(income)

    def get_all(self):
        return self.repository.get_all()

    def get_by_id(self, income_id: int):
        return self.repository.get_by_id(income_id)

    def update(self, income_id: int, income_data: IncomeUpdate):
        income = self.repository.get_by_id(income_id)
        if not income:
            return None
        
        update_data = income_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(income, field, value)
        
        return self.repository.update(income)

    def delete(self, income_id: int):
        income = self.repository.get_by_id(income_id)
        if not income:
            return False
        self.repository.delete(income)
        return True

    def get_recurring(self):
        return self.repository.get_recurring()

    def get_total_income(self) -> float:
        return self.repository.get_total_income()