"""
ClaimShield Nexus — Authentication & Identity Routes
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Dict, Any, List
from backend.data.models import User
from backend.data.database import db
from backend.security.auth import create_access_token, get_current_user, require_roles
from backend.security.audit import TamperEvidentAuditLedger

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str = "password"

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int = 28800
    user: User

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest):
    user = db.users.get(req.username)
    if not user:
        # Fallback to demo user if username matches prefix
        if "senior" in req.username:
            user = db.users.get("senior@acentra.com")
        elif "analyst" in req.username:
            user = db.users.get("analyst@acentra.com")
        elif "admin" in req.username:
            user = db.users.get("admin@acentra.com")
        else:
            user = db.users.get("investigator@acentra.com")
            
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or credentials")
        
    token = create_access_token(user)
    
    TamperEvidentAuditLedger.record_action(
        user=user,
        action_type="USER_LOGIN",
        target_resource=f"SESSION-{user.user_id}",
        details={"username": user.username, "role": user.role}
    )
    
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        expires_in_seconds=28800,
        user=user
    )

@router.get("/me", response_model=User)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=List[User])
def list_users(current_user: User = Depends(require_roles(["ADMIN", "SENIOR_INVESTIGATOR"]))):
    return list(db.users.values())
