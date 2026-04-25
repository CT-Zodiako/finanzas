from sqlalchemy import Column, Integer, String, Numeric, Date
from app.models.base import BaseModel


class DailyExpense(BaseModel):
    __tablename__ = "daily_expenses"

    description = Column(String(500), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    category = Column(String(100), nullable=True)
    date = Column(Date, nullable=False)