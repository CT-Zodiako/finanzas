from pydantic import BaseModel
from decimal import Decimal
from typing import List


class BudgetRecommendation(BaseModel):
    category: str
    percentage: float
    amount: Decimal
    description: str


class BudgetResponse(BaseModel):
    total_income: Decimal
    recommendations: List[BudgetRecommendation]