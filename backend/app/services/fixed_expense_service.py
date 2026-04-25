from sqlalchemy.orm import Session
from app.models.fixed_expense import FixedExpense
from app.repositories.fixed_expense_repository import FixedExpenseRepository
from app.schemas.fixed_expense import FixedExpenseCreate, FixedExpenseUpdate


class FixedExpenseService:
    def __init__(self, db: Session):
        self.repository = FixedExpenseRepository(db)

    def create(self, expense_data: FixedExpenseCreate) -> FixedExpense:
        expense = FixedExpense(**expense_data.model_dump())
        return self.repository.create(expense)

    def get_all(self):
        return self.repository.get_all()

    def get_by_id(self, expense_id: int):
        return self.repository.get_by_id(expense_id)

    def update(self, expense_id: int, expense_data: FixedExpenseUpdate):
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

    def get_active(self):
        return self.repository.get_active()

    def get_total_fixed_expenses(self) -> float:
        return self.repository.get_total_fixed_expenses()