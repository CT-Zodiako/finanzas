from pydantic import BaseModel, ConfigDict
from datetime import date
from decimal import Decimal
from typing import Optional


class DailyExpenseBase(BaseModel):
    description: str
    amount: Decimal
    category: Optional[str] = None
    date: date


class DailyExpenseCreate(DailyExpenseBase):
    pass


class DailyExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    category: Optional[str] = None
    date: Optional[date] = None


class DailyExpenseResponse(DailyExpenseBase):
    id: int

    model_config = ConfigDict(from_attributes=True)