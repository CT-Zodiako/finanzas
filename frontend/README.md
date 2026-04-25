# Frontend - Finanzas

Aplicación web Angular para gestión de finanzas personales.

## Características

- **Dashboard**: Resumen de finanzas con visualización de ingresos, gastos y balance
- **Gestión de Ingresos**: CRUD completo de ingresos con frecuencias
- **Gastos Diarios**: Registro y seguimiento de gastos diarios por categoría
- **Tema Oscuro Premium**: Diseño moderno con acentos verde/cyan

## Tecnologías

- Angular 21
- TypeScript
- SCSS
- Angular Signals
- Standalone Components

## Requisitos

- Node.js 18+
- Angular CLI

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar API

El frontend está configurado para conectarse al backend en `http://localhost:8000` a través de un proxy en desarrollo.

No se requiere configuración adicional si el backend está corriendo en el puerto 8000.

## Ejecutar la aplicación

```bash
ng serve
```

La aplicación estará disponible en: http://localhost:4200

## Endpoints del Backend

Asegúrate de que el backend esté corriendo antes de iniciar el frontend:

```bash
# En otra terminal, desde la carpeta backend/
cd ../backend
source env/bin/activate
uvicorn app.main:app --reload
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── models/              # Interfaces TypeScript
│   ├── services/            # Servicios Angular con Signals
│   ├── pages/               # Componentes de página
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── incomes/         # Gestión de ingresos
│   │   └── daily-expenses/  # Gastos diarios
│   ├── app.ts               # Componente raíz
│   ├── app.config.ts        # Configuración de Angular
│   └── app.routes.ts        # Rutas de la aplicación
├── styles/
│   └── _variables.scss      # Variables CSS (colores, tipografía)
└── styles.scss              # Estilos globales
```

## Servicios

| Servicio | Descripción |
|----------|-------------|
| `IncomeService` | CRUD de ingresos con Signals |
| `DailyExpenseService` | CRUD de gastos diarios con Signals |
| `DashboardService` | Resumen y categorías |

## Rutas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | redirect | Redirige a `/dashboard` |
| `/dashboard` | Dashboard | Resumen financiero |
| `/incomes` | Incomes | Gestión de ingresos |
| `/daily-expenses` | DailyExpenses | Gastos diarios |

## Scripts Disponibles

```bash
ng serve          # Iniciar en desarrollo (localhost:4200)
ng build          # Compilar para producción
ng build --configuration=development  # Compilar en modo desarrollo
```

## Conexión Frontend-Backend

```
Frontend (localhost:4200) ──proxy──> Backend (localhost:8000) ──> PostgreSQL
```

El archivo `proxy.conf.json` configura el proxy para evitar problemas de CORS durante el desarrollo.

## Licencia

MIT