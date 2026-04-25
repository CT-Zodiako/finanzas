# Backend - Finanzas API

API REST para gestión de finanzas personales.

## Características

- **Deudas**: Registro y seguimiento de deudas con pagos parciales
- **Ingresos**: Gestión de ingresos (fijos y variables)
- **Gastos Fijos**: control de gastos recurrentes (arrendamiento, servicios, etc.)
- **Gastos Diarios**: Registro de gastos diarios por categoría
- **Dashboard**: Resumen financiero mensual
- **Presupuesto**: Recomendaciones basadas en regla 50/30/20

## Tecnologías

- Python 3.11+
- FastAPI
- SQLAlchemy
- SQLite (file-based, zero-config)
- Pydantic

## Requisitos

- Python 3.11 o superior
- SQLite (incluido con Python, no requiere instalación)

## Instalación

### 1. Crear entorno virtual

```bash
cd backend
python -m venv env
```

### 2. Activar entorno virtual

```bash
# macOS / Linux
source env/bin/activate

# Windows
env\Scripts\activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

El archivo `.env` ya viene configurado con SQLite por defecto:

```env
DATABASE_URL=sqlite:///./finanzas.db
APP_NAME=Finanzas API
APP_VERSION=1.0.0
DEBUG=true
```

La base de datos SQLite se creará automáticamente al iniciar la aplicación.

### 5. Base de datos

SQLite no requiere configuración. Las tablas se crean automáticamente al iniciar.

Si necesitas PostgreSQL (legacy), usá el archivo `docker-compose.postgres.yml`:

```bash
docker-compose -f docker-compose.postgres.yml up -d
```

## Ejecutar el servidor (desarrollo backend)

```bash
cd backend
uvicorn app.main:app --reload
```

## Ejecutar con frontend estático (producción local)

Primero buildá el frontend:

```bash
cd frontend
npm ci
npm run build
```

Luego ejecutá el backend (ya sirve el frontend automáticamente):

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

La app estará disponible en: http://localhost:8000

El servidor estará disponible en: http://localhost:8000

## Documentación API

Una vez iniciado el servidor, accede a:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Endpoints

### Deudas
- `POST /api/v1/debts` - Crear deuda
- `GET /api/v1/debts` - Listar deudas
- `GET /api/v1/debts/{id}` - Obtener deuda
- `PUT /api/v1/debts/{id}` - Actualizar deuda
- `DELETE /api/v1/debts/{id}` - Eliminar deuda
- `POST /api/v1/debts/{id}/payment` - Registrar pago

### Ingresos
- `POST /api/v1/incomes` - Crear ingreso
- `GET /api/v1/incomes` - Listar ingresos
- `GET /api/v1/incomes/{id}` - Obtener ingreso
- `PUT /api/v1/incomes/{id}` - Actualizar ingreso
- `DELETE /api/v1/incomes/{id}` - Eliminar ingreso

### Gastos Fijos
- `POST /api/v1/fixed-expenses` - Crear gasto fijo
- `GET /api/v1/fixed-expenses` - Listar gastos fijos
- `GET /api/v1/fixed-expenses/{id}` - Obtener gasto fijo
- `PUT /api/v1/fixed-expenses/{id}` - Actualizar gasto fijo
- `DELETE /api/v1/fixed-expenses/{id}` - Eliminar gasto fijo

### Gastos Diarios
- `POST /api/v1/daily-expenses` - Crear gasto diario
- `GET /api/v1/daily-expenses` - Listar gastos diarios
- `GET /api/v1/daily-expenses/{id}` - Obtener gasto diario
- `PUT /api/v1/daily-expenses/{id}` - Actualizar gasto diario
- `DELETE /api/v1/daily-expenses/{id}` - Eliminar gasto diario

### Dashboard
- `GET /api/v1/dashboard/summary` - Resumen financiero
- `GET /api/v1/dashboard/categories` - Gastos por categoría

### Presupuesto
- `GET /api/v1/budget/recommendations` - Recomendaciones de presupuesto

## Estructura del Proyecto

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/    # Endpoints de la API
│   ├── core/                 # Configuración y base de datos
│   ├── models/               # Modelos SQLAlchemy
│   ├── schemas/              # Schemas Pydantic (DTOs)
│   ├── repositories/         # Acceso a datos
│   ├── services/             # Lógica de negocio
│   ├── mappers/              # Conversión entre capas
│   └── main.py               # Aplicación FastAPI
├── requirements.txt
├── .env
└── pyproject.toml
```

## Ejemplos de uso

### Crear un ingreso

```bash
curl -X POST http://localhost:8000/api/v1/incomes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salario",
    "amount": 5000.00,
    "frequency": "monthly",
    "is_recurring": true,
    "category": "Trabajo"
  }'
```

### Obtener resumen financiero

```bash
curl http://localhost:8000/api/v1/dashboard/summary
```

### Recomendaciones de presupuesto

```bash
curl http://localhost:8000/api/v1/budget/recommendations
```

## Licencia

MIT