from pydantic import BaseModel, ConfigDict
from datetime import date
from decimal import Decimal
from typing import Optional
from app.models.income import FrequencyEnum


class IncomeBase(BaseModel):
    name: str
    amount: Decimal
    frequency: FrequencyEnum = FrequencyEnum.MONTHLY
    is_recurring: bool = True
    category: Optional[str] = None
    date: Optional[date] = None


class IncomeCreate(IncomeBase):
    pass


class IncomeUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[Decimal] = None
    frequency: Optional[FrequencyEnum] = None
    is_recurring: Optional[bool] = None
    category: Optional[str] = None
    date: Optional[date] = None


class IncomeResponse(IncomeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)