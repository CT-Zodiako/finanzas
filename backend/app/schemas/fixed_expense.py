from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from typing import Optional


class FixedExpenseBase(BaseModel):
    name: str
    amount: Decimal
    category: Optional[str] = None
    due_day: Optional[int] = None
    is_active: bool = True


class FixedExpenseCreate(FixedExpenseBase):
    pass


class FixedExpenseUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[Decimal] = None
    category: Optional[str] = None
    due_day: Optional[int] = None
    is_active: Optional[bool] = None


class FixedExpenseResponse(FixedExpenseBase):
    id: int

    model_config = ConfigDict(from_attributes=True)