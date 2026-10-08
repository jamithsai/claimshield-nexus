"""
ClaimShield Nexus — Unified Full-Stack Platform Runner
Launches the FastAPI backend and serves the React SIU Dashboard.
"""

import os
import sys
import uvicorn

def main():
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print("=" * 70)
    print("[CLAIMSHIELD NEXUS] HEALTHCARE PROGRAM INTEGRITY PLATFORM")
    print("=" * 70)
    print(f"Starting FastAPI Engine & Static SIU Dashboard on {host}:{port}...")
    print(f"API Endpoint: http://{host}:{port}/api/v1")
    print(f"OpenAPI Docs: http://{host}:{port}/docs")
    print(f"SIU Workspace: http://{host}:{port}/")
    print("=" * 70)
    
    uvicorn.run("backend.main:app", host=host, port=port, reload=False)

if __name__ == "__main__":
    main()

