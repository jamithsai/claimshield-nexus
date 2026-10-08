"""
ClaimShield Nexus — Authentication & Role-Based Access Control (RBAC)
Handles JWT creation, verification, and declarative endpoint authorization.
"""

import jwt
import datetime
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from backend.data.models import User
from backend.data.database import db

SECRET_KEY = "claimshield-nexus-secure-enterprise-jwt-key-for-acentra-hackathon-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480 # 8 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security_bearer = HTTPBearer(auto_error=False)

def create_access_token(user: User) -> str:
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user.username,
        "user_id": user.user_id,
        "full_name": user.full_name,
        "role": user.role,
        "capacity": user.assigned_capacity,
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> User:
    # If no token provided during prototype browsing, default to primary Investigator
    if credentials is None:
        user = db.users.get("investigator@acentra.com")
        if user:
            return user
        return User(user_id="USR-101", username="investigator@acentra.com", full_name="Sarah Jenkins, CFE", role="INVESTIGATOR")
        
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")
            
        user = db.users.get(username)
        if user is None:
            return User(
                user_id=payload.get("user_id", "USR-GUEST"),
                username=username,
                full_name=payload.get("full_name", "Investigator"),
                role=payload.get("role", "INVESTIGATOR")
            )
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: User role '{current_user.role}' lacks permission. Required roles: {allowed_roles}"
            )
        return current_user
    return role_checker
