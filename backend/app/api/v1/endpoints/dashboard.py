from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.dashboard_service import DashboardService
from app.schemas.dashboard import DashboardSummary, CategorySummary
from typing import List

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(db: Session = Depends(get_db)):
    service = DashboardService(db)
    return service.get_summary()


@router.get("/categories", response_model=List[CategorySummary])
def get_categories(db: Session = Depends(get_db)):
    service = DashboardService(db)
    return service.get_category_expenses()