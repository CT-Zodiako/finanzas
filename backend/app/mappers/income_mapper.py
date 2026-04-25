from app.models.income import Income
from app.schemas.income import IncomeResponse


class IncomeMapper:
    @staticmethod
    def to_response(income: Income) -> IncomeResponse:
        return IncomeResponse.model_validate(income)