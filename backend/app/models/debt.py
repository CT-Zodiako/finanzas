from sqlalchemy import Column, Integer, String, Numeric, Float, Boolean, Date, ForeignKey, Index
from app.models.base import BaseModel


class Debt(BaseModel):
    __tablename__ = "debts"
    __table_args__ = (Index("ix_debts_user_id", "user_id"),)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String(255), nullable=False)
    creditor = Column(String(255), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    remaining_amount = Column(Numeric(12, 2), nullable=False)
    monthly_payment = Column(Numeric(12, 2), nullable=False)
    tipo = Column(String(50), default='credito')
    tasa_interes_mensual = Column(Float, nullable=True)
    fecha_limite = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
