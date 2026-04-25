from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.budget_service import BudgetService
from app.schemas.budget import BudgetResponse

router = APIRouter(prefix="/budget", tags=["Budget"])


@router.get("/recommendations", response_model=BudgetResponse)
def get_budget_recommendations(db: Session = Depends(get_db)):
    service = BudgetService(db)
    return service.get_recommendations()