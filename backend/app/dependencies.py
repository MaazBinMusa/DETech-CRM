from __future__ import annotations

from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.supabase_client import get_service_supabase_client, get_supabase_client

bearer_scheme = HTTPBearer(auto_error=False)


def get_access_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="A bearer access token is required.",
        )
    return credentials.credentials


def get_current_user(token: str = Depends(get_access_token)) -> Any:
    try:
        response = get_supabase_client().auth.get_user(token)
        user = getattr(response, "user", None)
        if user is None:
            user = getattr(getattr(response, "data", None), "user", None)
        if user is None:
            raise ValueError("Invalid access token")
        return user
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        ) from error


def get_database_client() -> Any:
    try:
        return get_service_supabase_client()
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Backend Supabase service-role configuration is missing.",
        ) from error
