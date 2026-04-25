from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.income_service import IncomeService
from app.schemas.income import IncomeCreate, IncomeUpdate, IncomeResponse
from app.mappers.income_mapper import IncomeMapper
from typing import List

router = APIRouter(prefix="/incomes", tags=["Incomes"])


@router.post("", response_model=IncomeResponse)
def create_income(income: IncomeCreate, db: Session = Depends(get_db)):
    service = IncomeService(db)
    new_income = service.create(income)
    return IncomeMapper.to_response(new_income)


@router.get("", response_model=List[IncomeResponse])
def get_all_incomes(db: Session = Depends(get_db)):
    service = IncomeService(db)
    incomes = service.get_all()
    return [IncomeMapper.to_response(i) for i in incomes]


@router.get("{income_id}", response_model=IncomeResponse)
def get_income(income_id: int, db: Session = Depends(get_db)):
    service = IncomeService(db)
    income = service.get_by_id(income_id)
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    return IncomeMapper.to_response(income)


@router.put("{income_id}", response_model=IncomeResponse)
def update_income(income_id: int, income: IncomeUpdate, db: Session = Depends(get_db)):
    service = IncomeService(db)
    updated_income = service.update(income_id, income)
    if not updated_income:
        raise HTTPException(status_code=404, detail="Income not found")
    return IncomeMapper.to_response(updated_income)


@router.delete("{income_id}")
def delete_income(income_id: int, db: Session = Depends(get_db)):
    service = IncomeService(db)
    deleted = service.delete(income_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Income not found")
    return {"message": "Income deleted successfully"}