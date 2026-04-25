from app.models.fixed_expense import FixedExpense
from app.schemas.fixed_expense import FixedExpenseResponse


class FixedExpenseMapper:
    @staticmethod
    def to_response(expense: FixedExpense) -> FixedExpenseResponse:
        return FixedExpenseResponse.model_validate(expense)