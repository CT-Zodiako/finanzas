from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.debt_service import DebtService
from app.schemas.debt import DebtCreate, DebtUpdate, DebtResponse, DebtPayment
from app.mappers.debt_mapper import DebtMapper
from typing import List

router = APIRouter(prefix="/debts", tags=["Debts"])


@router.post("")
def create_debt(debt: DebtCreate, db: Session = Depends(get_db)):
    service = DebtService(db)
    new_debt = service.create(debt)
    return DebtMapper.to_response(new_debt)


@router.get("")
def get_all_debts(db: Session = Depends(get_db)):
    service = DebtService(db)
    debts = service.get_all()
    return [DebtMapper.to_response(d) for d in debts]


@router.get("{debt_id}")
def get_debt(debt_id: int, db: Session = Depends(get_db)):
    service = DebtService(db)
    debt = service.get_by_id(debt_id)
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    return DebtMapper.to_response(debt)


@router.put("{debt_id}")
def update_debt(debt_id: int, debt: DebtUpdate, db: Session = Depends(get_db)):
    service = DebtService(db)
    updated_debt = service.update(debt_id, debt)
    if not updated_debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    return DebtMapper.to_response(updated_debt)


@router.delete("{debt_id}")
def delete_debt(debt_id: int, db: Session = Depends(get_db)):
    service = DebtService(db)
    deleted = service.delete(debt_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Debt not found")
    return {"message": "Debt deleted successfully"}


@router.post("{debt_id}/payment")
def make_payment(debt_id: int, payment: DebtPayment, db: Session = Depends(get_db)):
    service = DebtService(db)
    updated_debt = service.make_payment(debt_id, payment.payment_amount)
    if not updated_debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    return DebtMapper.to_response(updated_debt)


@router.get("summary")
def get_debt_summary(db: Session = Depends(get_db)):
    service = DebtService(db)
    return service.get_summary()