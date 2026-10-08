"""
ClaimShield Nexus — Unified Full-Stack Platform Runner
Launches the FastAPI backend and serves the React SIU Dashboard.
"""

import sys
import uvicorn

def main():
    print("=" * 70)
    print("[CLAIMSHIELD NEXUS] HEALTHCARE PROGRAM INTEGRITY PLATFORM")
    print("=" * 70)
    print("Starting FastAPI Engine & Static SIU Dashboard...")
    print("API Endpoint: http://localhost:8000/api/v1")
    print("OpenAPI Docs: http://localhost:8000/docs")
    print("SIU Workspace: http://localhost:8000/")
    print("=" * 70)
    
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)

if __name__ == "__main__":
    main()
