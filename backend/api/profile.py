import os
import sys
from datetime import datetime, timezone
from typing import Optional

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi import APIRouter, File, Header, HTTPException, UploadFile
from loguru import logger
from pydantic import BaseModel, Field

from utils.supabase_client import supabase

router = APIRouter(prefix="/api/profile", tags=["profile"])

AVATAR_BUCKET = "profile-avatars"
AVATAR_MAX_BYTES = 5 * 1024 * 1024
AVATAR_CONTENT_TYPES = {
    "image/jpeg": b"\xff\xd8\xff",
    "image/png": b"\x89PNG\r\n\x1a\n",
}


class ProfileUpdate(BaseModel):
    full_name: str = Field(default="", max_length=100)
    phone: str = Field(default="", max_length=32)
    location: str = Field(default="", max_length=120)
    website: str = Field(default="", max_length=200)
    timezone: str = Field(default="", max_length=64)
    bio: str = Field(default="", max_length=500)


def _get_authenticated_user(authorization: Optional[str]):
    if supabase is None:
        raise HTTPException(
            status_code=503,
            detail="Database is temporarily unavailable. Please try again in a few minutes.",
        )

    scheme, separator, token = (authorization or "").partition(" ")
    if not separator or scheme.lower() != "bearer" or not token.strip():
        raise HTTPException(status_code=401, detail="Please log in to view your profile.")

    try:
        return supabase.auth.get_user(token.strip()).user
    except Exception as error:
        logger.warning("Profile request with an invalid or expired token: {}", error)
        raise HTTPException(status_code=401, detail="Please log in to view your profile.")


def _profile_defaults(user, profile: Optional[dict] = None) -> dict:
    metadata = user.user_metadata or {}
    profile = profile or {}
    return {
        "id": user.id,
        "email": user.email,
        "full_name": profile.get("full_name") or metadata.get("full_name", ""),
        "phone": profile.get("phone", ""),
        "location": profile.get("location", ""),
        "website": profile.get("website", ""),
        "timezone": profile.get("timezone", ""),
        "bio": profile.get("bio", ""),
        "avatar_url": profile.get("avatar_url"),
        "account_created_at": user.created_at,
        "email_verified": user.email_confirmed_at is not None,
    }


@router.get("")
async def get_profile(authorization: Optional[str] = Header(default=None)):
    user = _get_authenticated_user(authorization)
    try:
        result = (
            supabase.table("profiles")
            .select("*")
            .eq("id", user.id)
            .limit(1)
            .execute()
        )
        profile = result.data[0] if result.data else None
        return _profile_defaults(user, profile)
    except Exception as error:
        logger.exception("Unable to load profile for user {}", user.id)
        raise HTTPException(status_code=500, detail="Unable to load your profile.") from error


@router.put("")
async def update_profile(
    request: ProfileUpdate,
    authorization: Optional[str] = Header(default=None),
):
    user = _get_authenticated_user(authorization)
    profile_data = request.model_dump()
    profile_data["id"] = user.id
    profile_data["email"] = user.email
    profile_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    try:
        result = supabase.table("profiles").upsert(profile_data).execute()
        profile = result.data[0] if result.data else profile_data
        return _profile_defaults(user, profile)
    except Exception as error:
        logger.exception("Unable to update profile for user {}", user.id)
        raise HTTPException(status_code=500, detail="Unable to save your profile.") from error


def _valid_image_signature(content_type: str, contents: bytes) -> bool:
    if content_type == "image/webp":
        return len(contents) >= 12 and contents[:4] == b"RIFF" and contents[8:12] == b"WEBP"
    signature = AVATAR_CONTENT_TYPES.get(content_type)
    return signature is not None and contents.startswith(signature)


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(default=None),
):
    user = _get_authenticated_user(authorization)
    contents = await file.read(AVATAR_MAX_BYTES + 1)
    if len(contents) > AVATAR_MAX_BYTES:
        raise HTTPException(status_code=413, detail="Profile images must be 5 MB or smaller.")

    content_type = file.content_type or ""
    if content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Choose a JPEG, PNG, or WebP image.")
    if not _valid_image_signature(content_type, contents):
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid supported image.")

    path = f"{user.id}/avatar"
    try:
        supabase.storage.from_(AVATAR_BUCKET).upload(
            path,
            contents,
            {
                "content-type": content_type,
                "upsert": "true",
                "cache-control": "3600",
            },
        )
        avatar_url = (
            f"{supabase.storage.from_(AVATAR_BUCKET).get_public_url(path)}"
            f"?v={int(datetime.now(timezone.utc).timestamp())}"
        )
        supabase.table("profiles").upsert(
            {
                "id": user.id,
                "email": user.email,
                "avatar_url": avatar_url,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        ).execute()
        return {"avatar_url": avatar_url}
    except Exception as error:
        logger.exception("Unable to upload profile image for user {}", user.id)
        raise HTTPException(status_code=500, detail="Unable to upload your profile image.") from error


@router.delete("/avatar")
async def delete_avatar(authorization: Optional[str] = Header(default=None)):
    user = _get_authenticated_user(authorization)
    try:
        result = (
            supabase.table("profiles")
            .select("avatar_url")
            .eq("id", user.id)
            .limit(1)
            .execute()
        )
        if result.data and result.data[0].get("avatar_url"):
            supabase.storage.from_(AVATAR_BUCKET).remove([f"{user.id}/avatar"])
            supabase.table("profiles").upsert(
                {
                    "id": user.id,
                    "email": user.email,
                    "avatar_url": None,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
            ).execute()
        return {"avatar_url": None}
    except Exception as error:
        logger.exception("Unable to remove profile image for user {}", user.id)
        raise HTTPException(status_code=500, detail="Unable to remove your profile image.") from error
