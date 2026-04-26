"""
Script para inicializar datos por defecto en la base de datos SQLite.
Solo se ejecuta UNA vez cuando la DB está vacía.
NO se vuelve a ejecutar una vez cargado los datos.
"""
import sqlite3
from pathlib import Path

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.income import Income
from app.models.debt import Debt
from app.models.fixed_expense import FixedExpense
from app.models.daily_expense import DailyExpense

# Ruta al archivo SQL de backup
BACKUP_SQL = Path(__file__).parent.parent / "seed_data.sql"


def seed_database_if_empty(db_path: str = "finanzas.db"):
    """Carga los datos iniciales solo si la base está vacía Y nunca se ha ejecutado el seed."""
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Verificar si existe la tabla de metadata (se crea la primera vez que corre el seed)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS _metadata (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    """)
    
    # Verificar si ya se ejecutó el seed alguna vez
    cursor.execute("SELECT value FROM _metadata WHERE key = 'seed_loaded'")
    result = cursor.fetchone()
    
    if result and result[0] == 'true':
        conn.close()
        return False  # Ya se ejecutó antes, no hacer nada
    
    # Verificar si hay datos en las tablas principales
    cursor.execute("SELECT COUNT(*) FROM incomes")
    incomes_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM debts")
    debts_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM fixed_expenses")
    fixed_count = cursor.fetchone()[0]
    
    # Si hay datos, marcar como ya cargado y salir
    if incomes_count > 0 or debts_count > 0 or fixed_count > 0:
        cursor.execute("INSERT OR REPLACE INTO _metadata (key, value) VALUES ('seed_loaded', 'true')")
        conn.commit()
        conn.close()
        print("📊 Base de datos ya tiene datos, seed marcado como completado.")
        return False
    
    # Si está vacía Y nunca se ejecutó el seed, cargar los datos
    if BACKUP_SQL.exists():
        print("📥 Cargando datos iniciales...")
        with open(BACKUP_SQL, 'r') as f:
            conn.executescript(f.read())
        
        # Marcar como ejecutado
        cursor.execute("INSERT OR REPLACE INTO _metadata (key, value) VALUES ('seed_loaded', 'true')")
        conn.commit()
        conn.close()
        
        # Verificar que se cargaron
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM incomes")
        incomes = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM debts")
        debts = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM fixed_expenses")
        fixed = cursor.fetchone()[0]
        conn.close()
        
        print(f"✅ Datos cargados: {incomes} ingresos, {debts} deudas, {fixed} gastos fijos")
        return True
    else:
        conn.close()
        print(f"⚠️ Archivo seed_data.sql no encontrado en {BACKUP_SQL}")
        return False


def ensure_bootstrap_user_and_backfill() -> None:
    """Crea usuario Cristian y asigna user_id a datos legacy sin dueño."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "cristianjvz98@gmail.com").first()
        if not user:
            user = User(
                nombre="Cristian",
                email="cristianjvz98@gmail.com",
                password_hash=hash_password("Tgrmw1k"),
                rol="admin",
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"✅ Usuario bootstrap creado: christianjvz98@gmail.com / Tgrmw1k")

        db.query(Income).filter(Income.user_id.is_(None)).update({"user_id": user.id})
        db.query(Debt).filter(Debt.user_id.is_(None)).update({"user_id": user.id})
        db.query(FixedExpense).filter(FixedExpense.user_id.is_(None)).update({"user_id": user.id})
        db.query(DailyExpense).filter(DailyExpense.user_id.is_(None)).update({"user_id": user.id})
        db.commit()
        print(f"📊 Datos legacy asignados al usuario ID: {user.id}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database_if_empty()
