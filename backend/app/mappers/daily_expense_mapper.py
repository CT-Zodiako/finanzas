from app.models.daily_expense import DailyExpense
from app.schemas.daily_expense import DailyExpenseResponse


class DailyExpenseMapper:
    @staticmethod
    def to_response(expense: DailyExpense) -> DailyExpenseResponse:
        return DailyExpenseResponse.model_validate(expense)