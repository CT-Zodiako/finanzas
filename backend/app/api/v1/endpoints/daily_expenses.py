from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.daily_expense_service import DailyExpenseService
from app.schemas.daily_expense import DailyExpenseCreate, DailyExpenseUpdate, DailyExpenseResponse
from app.mappers.daily_expense_mapper import DailyExpenseMapper
from typing import List

router = APIRouter(prefix="/daily-expenses", tags=["Daily Expenses"])


@router.post("")
def create_daily_expense(expense: DailyExpenseCreate, db: Session = Depends(get_db)):
    service = DailyExpenseService(db)
    new_expense = service.create(expense)
    return DailyExpenseMapper.to_response(new_expense)


@router.get("")
def get_all_daily_expenses(db: Session = Depends(get_db)):
    service = DailyExpenseService(db)
    expenses = service.get_all()
    return [DailyExpenseMapper.to_response(e) for e in expenses]


@router.get("{expense_id}")
def get_daily_expense(expense_id: int, db: Session = Depends(get_db)):
    service = DailyExpenseService(db)
    expense = service.get_by_id(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Daily expense not found")
    return DailyExpenseMapper.to_response(expense)


@router.put("{expense_id}")
def update_daily_expense(expense_id: int, expense: DailyExpenseUpdate, db: Session = Depends(get_db)):
    service = DailyExpenseService(db)
    updated_expense = service.update(expense_id, expense)
    if not updated_expense:
        raise HTTPException(status_code=404, detail="Daily expense not found")
    return DailyExpenseMapper.to_response(updated_expense)


@router.delete("{expense_id}")
def delete_daily_expense(expense_id: int, db: Session = Depends(get_db)):
    service = DailyExpenseService(db)
    deleted = service.delete(expense_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Daily expense not found")
    return {"message": "Daily expense deleted successfully"}