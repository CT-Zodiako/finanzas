from sqlalchemy.orm import Session
from app.models.income import Income
from app.repositories.income_repository import IncomeRepository
from app.schemas.income import IncomeCreate, IncomeUpdate


class IncomeService:
    def __init__(self, db: Session):
        self.repository = IncomeRepository(db)

    def create(self, income_data: IncomeCreate, user_id: int) -> Income:
        income = Income(**income_data.model_dump(), user_id=user_id)
        return self.repository.create(income)

    def get_all(self, user_id: int):
        return self.repository.get_all(user_id)

    def get_by_id(self, income_id: int, user_id: int):
        return self.repository.get_by_id(income_id, user_id)

    def update(self, income_id: int, income_data: IncomeUpdate, user_id: int):
        income = self.repository.get_by_id(income_id, user_id)
        if not income:
            return None
        
        update_data = income_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(income, field, value)
        
        return self.repository.update(income)

    def delete(self, income_id: int, user_id: int):
        income = self.repository.get_by_id(income_id, user_id)
        if not income:
            return False
        self.repository.delete(income)
        return True

    def get_recurring(self, user_id: int):
        return self.repository.get_recurring(user_id)

    def get_total_income(self, user_id: int) -> float:
        return self.repository.get_total_income(user_id)
