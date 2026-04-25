from sqlalchemy import Column, Integer, String, Numeric, Boolean
from app.models.base import BaseModel


class FixedExpense(BaseModel):
    __tablename__ = "fixed_expenses"

    name = Column(String(255), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    category = Column(String(100), nullable=True)
    due_day = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)