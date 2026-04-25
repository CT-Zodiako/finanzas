from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.debt import Debt
from app.models.income import Income
from app.models.fixed_expense import FixedExpense
from app.core.database import Base

DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

existing_debts = db.query(Debt).count()
if existing_debts == 0:
    debts_data = [
        {"name": "Tuya Cristian", "creditor": "Exito", "amount": 9200000, "remaining_amount": 9200000, "monthly_payment": 782585, "tipo": "tarjeta", "fecha_limite": date(2026, 5, 10), "is_active": True},
        {"name": "Iphone 16 Pro max", "creditor": "Banco de bogota", "amount": 4973648, "remaining_amount": 3886141, "monthly_payment": 458415, "tipo": "credito", "fecha_limite": date(2026, 5, 1), "is_active": True},
        {"name": "Davivienda Cristian", "creditor": "Davivienda", "amount": 2200000, "remaining_amount": 2200000, "monthly_payment": 330000, "tipo": "tarjeta", "fecha_limite": date(2026, 5, 15), "is_active": True},
        {"name": "Addi Cristian", "creditor": "Addi", "amount": 5829354, "remaining_amount": 5829354, "monthly_payment": 783127, "tipo": "credito", "fecha_limite": date(2026, 5, 10), "is_active": True},
        {"name": "Tuya Valentina", "creditor": "Exito", "amount": 4600000, "remaining_amount": 4242803, "monthly_payment": 579587, "tipo": "tarjeta", "fecha_limite": date(2026, 5, 20), "is_active": True},
        {"name": "Rappi Valentina", "creditor": "Rappi", "amount": 6650000, "remaining_amount": 4773175, "monthly_payment": 400000, "tipo": "tarjeta", "fecha_limite": date(2026, 5, 15), "is_active": True},
        {"name": "Rappi Cristian", "creditor": "Rappi", "amount": 2700000, "remaining_amount": 2514673, "monthly_payment": 220000, "tipo": "tarjeta", "fecha_limite": date(2026, 5, 20), "is_active": True},
        {"name": "Addi Valentina", "creditor": "Addi", "amount": 8367500, "remaining_amount": 4959050, "monthly_payment": 824511, "tipo": "credito", "fecha_limite": date(2026, 5, 1), "is_active": True},
        {"name": "Liliana", "creditor": "Abuela", "amount": 430000, "remaining_amount": 430000, "monthly_payment": 430000, "tipo": "personal", "fecha_limite": date(2026, 5, 1), "is_active": True},
        {"name": "Alvaro", "creditor": "Alvaro", "amount": 410000, "remaining_amount": 410000, "monthly_payment": 205000, "tipo": "personal", "fecha_limite": date(2026, 5, 1), "is_active": True},
        {"name": "Lina", "creditor": "ETIC", "amount": 1000000, "remaining_amount": 500000, "monthly_payment": 500000, "tipo": "personal", "fecha_limite": date(2026, 5, 6), "is_active": True},
    ]
    
    for d in debts_data:
        debt = Debt(**d)
        db.add(debt)
    
    db.commit()
    print(f"✅ {len(debts_data)} debts imported")

existing_incomes = db.query(Income).count()
if existing_incomes == 0:
    incomes_data = [
        {"name": "Salaraio Franz", "amount": 2000000, "frequency": "monthly", "is_recurring": True, "category": "Pagos"},
        {"name": "Unimayor Salario", "amount": 4370000, "frequency": "monthly", "is_recurring": True, "category": "Pagos"},
        {"name": "Alcaldia", "amount": 2700000, "frequency": "monthly", "is_recurring": True, "category": "Pagos"},
        {"name": "Marzo Balance", "amount": 1500000, "frequency": "monthly", "is_recurring": True, "category": "Pago"},
        {"name": "Evelyn", "amount": 400000, "frequency": "monthly", "is_recurring": False, "category": ""},
    ]
    
    for i in incomes_data:
        income = Income(**i)
        db.add(income)
    
    db.commit()
    print(f"✅ {len(incomes_data)} incomes imported")

existing_fixed = db.query(FixedExpense).count()
if existing_fixed == 0:
    fixed_data = [
        {"name": "Arriendo", "amount": 550000, "category": "Vivienda", "due_day": 6, "is_active": True},
        {"name": "Servicios", "amount": 250000, "category": "servicios", "due_day": 12, "is_active": True},
        {"name": "Gasolina", "amount": 200000, "category": "Transporte", "due_day": 1, "is_active": True},
        {"name": "Casa", "amount": 500000, "category": "Comida", "due_day": 30, "is_active": True},
        {"name": "Planillas", "amount": 1010000, "category": "Planillas", "due_day": 1, "is_active": True},
    ]
    
    for f in fixed_data:
        fixed = FixedExpense(**f)
        db.add(fixed)
    
    db.commit()
    print(f"✅ {len(fixed_data)} fixed expenses imported")

db.close()
print("✅ Database initialized with all data")
