"""
ClaimShield Nexus — FastAPI Master Application
Enterprise Healthcare Program Integrity & FWA Intelligence Platform
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.engine.coordinator import PipelineCoordinator
from backend.api.routes import (
    auth_router,
    overview_router,
    siu_router,
    cases_router,
    graph_router,
    simulation_router,
    analytics_router,
    audit_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Run pipeline and seed synthetic claims and graph intelligence
    print("[INIT] Initializing ClaimShield Nexus Engine...")
    PipelineCoordinator.run_full_pipeline(num_members=1500, num_providers=80, num_facilities=25)
    print("[READY] Synthetic Claims Engine & SIU Prioritization Ready.")
    yield
    print("[SHUTDOWN] Shutting down ClaimShield Nexus.")

app = FastAPI(
    title="ClaimShield Nexus — Program Integrity Intelligence Platform",
    description="Enterprise Healthcare Fraud, Waste & Abuse (FWA) Detection, Graph Intelligence & Investigator Prioritization",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(overview_router, prefix="/api/v1")
app.include_router(siu_router, prefix="/api/v1")
app.include_router(cases_router, prefix="/api/v1")
app.include_router(graph_router, prefix="/api/v1")
app.include_router(simulation_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(audit_router, prefix="/api/v1")

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "ClaimShield Nexus",
        "version": "1.0.0",
        "mode": "SYNTHETIC_RESEARCH_BENCHMARK",
        "data_classification": "SYNTHETIC_PUBLIC_ONLY"
    }

# Serve Built Frontend Static Files if available
dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API routes to pass through
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = os.path.join(dist_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)

