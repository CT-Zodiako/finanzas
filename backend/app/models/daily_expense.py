from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey, Index
from app.models.base import BaseModel


class DailyExpense(BaseModel):
    __tablename__ = "daily_expenses"
    __table_args__ = (Index("ix_daily_expenses_user_id", "user_id"),)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    description = Column(String(500), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    category = Column(String(100), nullable=True)
    date = Column(Date, nullable=False)
