# PRD: Migración a SQLite + Despliegue Local

## 1. Contexto y Motivación

**Proyecto:** Finanzas Personales — App full-stack para gestión de finanzas personales
**Stack actual:** Angular 21 + FastAPI + PostgreSQL
**Problema:** PostgreSQL requiere servidor dedicado, más RAM, y complica el despliegue en la máquina objetivo (Celeron N3350, 4GB RAM)
**Solución:** Migrar a SQLite (file-based, zero-config) y crear un deploy script bulletproof para correr localmente

## 2. Objetivos

1. **Eliminar dependencia de PostgreSQL** — SQLite como base de datos por defecto
2. **Servir frontend desde FastAPI** — Single-process deployment, Angular estático + API en mismo servidor
3. **Deploy script amigable** — Validación automática, auto-corrección de errores, progreso visual
4. **Máquina objetivo** — Debe correr fluido en Celeron N3350 con 4GB RAM

## 3. Requerimientos Funcionales

### 3.1 Base de Datos
- [ ] SQLite como DB por defecto (`sqlite:///./finanzas.db`)
- [ ] Mantener compatibilidad con SQLAlchemy (cambio transparente para modelos)
- [ ] Activar foreign keys en SQLite (`PRAGMA foreign_keys=ON`)
- [ ] Eliminar `psycopg2-binary` de dependencias
- [ ] Creación automática de tablas al iniciar (`Base.metadata.create_all`)

### 3.2 Backend — FastAPI
- [ ] Servir archivos estáticos de Angular desde `/`
- [ ] Preservar API en `/api/v1/*`
- [ ] SPA fallback: rutas desconocidas (no API) devuelven `index.html`
- [ ] Ajustar CORS si es necesario para same-origin
- [ ] Single-worker (`workers=1`) por limitaciones de SQLite

### 3.3 Frontend — Angular
- [ ] API calls deben seguir siendo relativos (`/api/v1/...`)
- [ ] Build de producción debe generarse en path determinista
- [ ] No requerir configuración adicional para modo "producción local"

### 3.4 Deploy Script (Bulletproof)
- [ ] **Validación de prerequisitos:**
  - Node.js >= 18 instalado
  - npm disponible
  - Python >= 3.11 instalado
  - pip disponible
- [ ] **Auto-corrección:**
  - Instalar `npm ci` si `node_modules` no existe
  - Crear virtual env de Python si no existe
  - Instalar requirements si faltan
  - Crear `.env` por defecto si no existe
- [ ] **Build process:**
  - Build de Angular en modo producción
  - Verificar que el output existe
- [ ] **Inicio:**
  - Iniciar FastAPI con Uvicorn (single worker)
  - Mostrar URL de acceso
- [ ] **UX:**
  - Colores y emojis para estado (✅ ❌ ⚠️)
  - Barra de progreso o pasos numerados
  - Mensajes de error claros con sugerencias de fix
  - Modo verbose opcional (`--verbose`)

## 4. Requerimientos No Funcionales

- **Rendimiento:** Startup < 5 segundos en Celeron N3350
- **RAM:** Consumo total < 300MB en reposo (FastAPI + SQLite file)
- **CPU:** Single worker, no multiproceso en SQLite
- **Portabilidad:** Script debe funcionar en Linux (target machine)
- **Seguridad:** No exponer secrets en logs; validar inputs

## 5. Escenarios de Uso

### Escenario 1: Fresh clone (Happy Path)
1. Usuario clona el repo
2. Ejecuta `./deploy.sh`
3. Script valida todo → instala deps → build → inicia
4. App disponible en `http://localhost:8000`

### Escenario 2: Falta Node.js
1. Script detecta que `node` no está en PATH
2. Muestra: ❌ Node.js no encontrado
3. Sugiere: "Instalá Node.js 18+ con: sudo apt install nodejs npm"
4. Sale con código de error claro

### Escenario 3: Python dependencies faltantes
1. Script intenta importar fastapi
2. Falla → detecta que requirements no están instalados
3. Auto-ejecuta `pip install -r requirements.txt`
4. Reintenta → continúa

### Escenario 4: Frontend ya buildado
1. Script detecta que `frontend/dist/` existe y es reciente
2. Pregunta: "¿Rebuild? (s/N)" o usa flag `--skip-build`
3. Ahorra tiempo en re-deploys

### Escenario 5: Puerto ocupado
1. Puerto 8000 está en uso
2. Script detecta con `lsof` o `netstat`
3. Sugiere: "Puerto 8000 ocupado. ¿Usar 8001? (s/n)"

## 6. Criterios de Aceptación

- [ ] `python app/main.py` (o `uvicorn`) inicia sin errores con SQLite
- [ ] `curl http://localhost:8000/api/v1/dashboard/summary` responde correctamente
- [ ] Navegar a `http://localhost:8000` carga la app Angular
- [ ] Refrescar una ruta del frontend (ej: `/debts`) funciona (SPA fallback)
- [ ] `./deploy.sh` en una máquina limpia (con Node+Python) despliega la app exitosamente
- [ ] El script maneja gracefulmente todos los escenarios definidos

## 7. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| SPA fallback intercepta `/api/*` | Media | Alto | Ordenar mounts: API primero, static después, fallback al final |
| SQLite locked por concurrencia | Baja | Media | Single worker, documentar limitación |
| Node/Python version incompatibles | Media | Media | Validar versiones en script, mostrar mensajes claros |
| Data loss en SQLite (file corrupto) | Baja | Alto | Backup automático del .db al iniciar |

## 8. Definition of Done

- [ ] SQLite funciona como DB principal
- [ ] PostgreSQL dependencies removidas
- [ ] FastAPI sirve Angular estático + SPA fallback
- [ ] Deploy script valida, corrige, e inicia todo automáticamente
- [ ] README actualizado con instrucciones nuevas
- [ ] `docker-compose.yml` removido o marcado como legacy
- [ ] Probado en máquina local (simulando target)
