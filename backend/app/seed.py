"""
Script para inicializar datos por defecto en la base de datos SQLite.
Se ejecuta automáticamente al iniciar el servidor si la DB está vacía.
"""
import sqlite3
from pathlib import Path

# Ruta al archivo SQL de backup
BACKUP_SQL = Path(__file__).parent.parent / "seed_data.sql"


def seed_database_if_empty(db_path: str = "finanzas.db"):
    """Carga los datos iniciales solo si la base está vacía."""
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Verificar si hay datos en las tablas principales
    cursor.execute("SELECT COUNT(*) FROM incomes")
    incomes_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM debts")
    debts_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM fixed_expenses")
    fixed_count = cursor.fetchone()[0]
    
    conn.close()
    
    # Si hay datos, no hacer nada
    if incomes_count > 0 or debts_count > 0 or fixed_count > 0:
        print("📊 Base de datos ya tiene datos, omitiendo seed.")
        return False
    
    # Si está vacía, cargar los datos
    if BACKUP_SQL.exists():
        print("📥 Cargando datos iniciales...")
        conn = sqlite3.connect(db_path)
        with open(BACKUP_SQL, 'r') as f:
            conn.executescript(f.read())
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
        print(f"⚠️ Archivo seed_data.sql no encontrado en {BACKUP_SQL}")
        return False


if __name__ == "__main__":
    seed_database_if_empty()