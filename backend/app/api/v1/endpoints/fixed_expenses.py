from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.fixed_expense_service import FixedExpenseService
from app.schemas.fixed_expense import FixedExpenseCreate, FixedExpenseUpdate, FixedExpenseResponse
from app.mappers.fixed_expense_mapper import FixedExpenseMapper
from typing import List

router = APIRouter(prefix="/fixed-expenses", tags=["Fixed Expenses"])


@router.post("")
def create_fixed_expense(expense: FixedExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = FixedExpenseService(db)
    new_expense = service.create(expense, current_user.id)
    return FixedExpenseMapper.to_response(new_expense)


@router.get("")
def get_all_fixed_expenses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = FixedExpenseService(db)
    expenses = service.get_all(current_user.id)
    return [FixedExpenseMapper.to_response(e) for e in expenses]


@router.get("/{expense_id}")
def get_fixed_expense(expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = FixedExpenseService(db)
    expense = service.get_by_id(expense_id, current_user.id)
    if not expense:
        raise HTTPException(status_code=404, detail="Fixed expense not found")
    return FixedExpenseMapper.to_response(expense)


@router.put("/{expense_id}")
def update_fixed_expense(expense_id: int, expense: FixedExpenseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = FixedExpenseService(db)
    updated_expense = service.update(expense_id, expense, current_user.id)
    if not updated_expense:
        raise HTTPException(status_code=404, detail="Fixed expense not found")
    return FixedExpenseMapper.to_response(updated_expense)


@router.delete("/{expense_id}")
def delete_fixed_expense(expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = FixedExpenseService(db)
    deleted = service.delete(expense_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Fixed expense not found")
    return {"message": "Fixed expense deleted successfully"}
