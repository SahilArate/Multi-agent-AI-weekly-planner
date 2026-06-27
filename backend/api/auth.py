import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from loguru import logger
from utils.supabase_client import supabase

router = APIRouter(prefix="/api/auth", tags=["auth"])

class SignUpRequest(BaseModel):
    email: str
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

def check_supabase():
    if supabase is None:
        raise HTTPException(
            status_code=503,
            detail="Database is temporarily unavailable. Please try again in a few minutes."
        )

@router.post("/signup")
async def signup(request: SignUpRequest):
    check_supabase()
    try:
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.full_name
                }
            }
        })
        logger.success(f"New user signed up: {request.email}")
        return {
            "status": "success",
            "message": "Account created! Check your email to verify.",
            "user": {
                "id": response.user.id,
                "email": response.user.email
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup failed: {e}")
        raise HTTPException(status_code=400, detail="Database is temporarily unavailable. Please try again in a few minutes.")

@router.post("/login")
async def login(request: LoginRequest):
    check_supabase()
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        logger.success(f"User logged in: {request.email}")
        return {
            "status": "success",
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid email or password")

@router.post("/logout")
async def logout():
    check_supabase()
    try:
        supabase.auth.sign_out()
        return {"status": "success", "message": "Logged out"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))