from sqlalchemy.orm import Session
from app.models.fixed_expense import FixedExpense
from app.repositories.fixed_expense_repository import FixedExpenseRepository
from app.schemas.fixed_expense import FixedExpenseCreate, FixedExpenseUpdate


class FixedExpenseService:
    def __init__(self, db: Session):
        self.repository = FixedExpenseRepository(db)

    def create(self, expense_data: FixedExpenseCreate, user_id: int) -> FixedExpense:
        expense = FixedExpense(**expense_data.model_dump(), user_id=user_id)
        return self.repository.create(expense)

    def get_all(self, user_id: int):
        return self.repository.get_all(user_id)

    def get_by_id(self, expense_id: int, user_id: int):
        return self.repository.get_by_id(expense_id, user_id)

    def update(self, expense_id: int, expense_data: FixedExpenseUpdate, user_id: int):
        expense = self.repository.get_by_id(expense_id, user_id)
        if not expense:
            return None
        
        update_data = expense_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(expense, field, value)
        
        return self.repository.update(expense)

    def delete(self, expense_id: int, user_id: int):
        expense = self.repository.get_by_id(expense_id, user_id)
        if not expense:
            return False
        self.repository.delete(expense)
        return True

    def get_active(self, user_id: int):
        return self.repository.get_active(user_id)

    def get_total_fixed_expenses(self, user_id: int) -> float:
        return self.repository.get_total_fixed_expenses(user_id)
