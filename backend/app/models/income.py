from sqlalchemy import Column, Integer, String, Numeric, Boolean, Date, Enum as SQLEnum, ForeignKey, Index
import enum
from app.models.base import BaseModel


class FrequencyEnum(str, enum.Enum):
    MONTHLY = "monthly"
    BIWEEKLY = "biweekly"
    WEEKLY = "weekly"
    DAILY = "daily"


class Income(BaseModel):
    __tablename__ = "incomes"
    __table_args__ = (Index("ix_incomes_user_id", "user_id"),)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String(255), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    frequency = Column(SQLEnum(FrequencyEnum), default=FrequencyEnum.MONTHLY)
    is_recurring = Column(Boolean, default=True)
    category = Column(String(100), nullable=True)
    date = Column(Date, nullable=True)
