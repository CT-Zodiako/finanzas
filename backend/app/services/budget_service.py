from sqlalchemy.orm import Session
from decimal import Decimal
from app.repositories.income_repository import IncomeRepository
from app.schemas.budget import BudgetResponse, BudgetRecommendation


class BudgetService:
    def __init__(self, db: Session):
        self.income_repo = IncomeRepository(db)

    def get_recommendations(self) -> BudgetResponse:
        total_income = Decimal(str(self.income_repo.get_total_income()))
        
        recommendations = [
            BudgetRecommendation(
                category="Necesidades (50%)",
                percentage=50,
                amount=total_income * Decimal("0.50"),
                description="Gastos esenciales: vivienda, servicios, alimentacion, transporte"
            ),
            BudgetRecommendation(
                category="Deseos (30%)",
                percentage=30,
                amount=total_income * Decimal("0.30"),
                description="Entretenimiento, restaurantes, hobbies, suscripciones"
            ),
            BudgetRecommendation(
                category="Ahorros y Deudas (20%)",
                percentage=20,
                amount=total_income * Decimal("0.20"),
                description="Ahorros, inversiones, pago de deudas"
            )
        ]
        
        return BudgetResponse(
            total_income=total_income,
            recommendations=recommendations
        )