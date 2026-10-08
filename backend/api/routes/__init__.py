"""
ClaimShield Nexus — API Routes Package
"""
from .auth import router as auth_router
from .overview import router as overview_router
from .siu import router as siu_router
from .cases import router as cases_router
from .graph import router as graph_router
from .simulation import router as simulation_router
from .analytics import router as analytics_router
from .audit import router as audit_router

__all__ = [
    "auth_router", "overview_router", "siu_router", "cases_router",
    "graph_router", "simulation_router", "analytics_router", "audit_router"
]
