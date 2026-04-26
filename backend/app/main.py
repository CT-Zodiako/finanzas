from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from app.api.v1.router import api_router
from app.core.database import init_db
from app.core.config import settings
from app.seed import seed_database_if_empty, ensure_bootstrap_user_and_backfill

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API ROUTES - se registran primero
app.include_router(api_router, prefix="/api")


@app.on_event("startup")
def startup_event():
    init_db()
    # Cargar datos iniciales si la DB está vacía
    seed_database_if_empty()
    ensure_bootstrap_user_and_backfill()


@app.get("/health")
def health_check():
    return {"status": "healthy"}


static_dir = Path(settings.STATIC_DIR)

if static_dir.exists():
    # Servir index.html en raíz
    @app.get("/", response_class=JSONResponse)
    async def serve_index():
        return FileResponse(str(static_dir / "index.html"))
    
    # Montar assets si existe
    if (static_dir / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(static_dir / "assets")), name="assets")
    
    # SPA fallback para rutas de una sola palabra (sin /)
    @app.get("/{route}")
    async def serve_spa_fallback(route: str):
        # Rutas conocidas que NO son de API - estas son rutas de SPA
        spa_routes = ['login', 'register', 'debts', 'incomes', 'fixed-expenses', 'daily-expenses', 'dashboard', 'budget', 'optimize']
        
        if route in spa_routes:
            return FileResponse(str(static_dir / "index.html"))
        
        # Si tiene extensión, es archivo estático
        if "." in route:
            static_file = static_dir / route
            if static_file.exists():
                return FileResponse(str(static_file))
            raise HTTPException(status_code=404, detail=f"Archivo no encontrado: {route}")
        
        raise HTTPException(status_code=404, detail=f"Ruta no encontrada: {route}")
else:
    @app.get("/")
    def root():
        return {
            "message": "Finanzas API",
            "version": settings.APP_VERSION,
            "status": "Frontend no disponible"
        }
