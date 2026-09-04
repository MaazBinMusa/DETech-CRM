from __future__ import annotations

import re
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user, get_database_client
from app.models import AuthCredentials, CustomerCodeCreate, CustomerCreate
from app.supabase_client import get_supabase_client

router = APIRouter(prefix="/api")


def response_data(response: Any) -> Any:
    return getattr(response, "data", None) if response is not None else None


def auth_response_data(response: Any) -> Dict[str, Any]:
    if response is None:
        return {"user": None, "session": None}

    user = getattr(response, "user", None)
    session = getattr(response, "session", None)
    if user is None and session is None:
        data = response_data(response)
        if isinstance(data, dict):
            user = data.get("user")
            session = data.get("session")

    return {
        "user": user.model_dump(mode="json") if hasattr(user, "model_dump") else user,
        "session": session.model_dump(mode="json") if hasattr(session, "model_dump") else session,
    }


@router.post("/auth/signup")
def signup(credentials: AuthCredentials) -> Dict[str, Any]:
    try:
        result = get_supabase_client().auth.sign_up(
            {"email": credentials.email, "password": credentials.password}
        )
        return auth_response_data(result)
    except Exception as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error


@router.post("/auth/login")
def login(credentials: AuthCredentials) -> Dict[str, Any]:
    try:
        result = get_supabase_client().auth.sign_in_with_password(
            {"email": credentials.email, "password": credentials.password}
        )
    except Exception as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error)) from error

    return auth_response_data(result)


@router.post("/auth/logout")
def logout(_: Any = Depends(get_current_user)) -> Dict[str, str]:
    return {"message": "Signed out locally."}


@router.get("/customer-codes")
def list_customer_codes(
    _: Any = Depends(get_current_user),
    client: Any = Depends(get_database_client),
) -> List[Dict[str, Any]]:
    result = client.table("customer_codes").select("*").order("created_at", desc=True).execute()
    return response_data(result) or []


@router.post("/customer-codes", status_code=status.HTTP_201_CREATED)
def create_customer_code(
    payload: CustomerCodeCreate,
    _: Any = Depends(get_current_user),
    client: Any = Depends(get_database_client),
) -> Dict[str, Any]:
    industry_code = payload.industry_code.strip().upper()
    customer_code = payload.customer_code.strip()
    if not re.fullmatch(r"[A-Z]{2}", industry_code):
        raise HTTPException(status_code=422, detail="Industry code must be exactly 2 letters.")
    if not re.fullmatch(r"\d{4}", customer_code):
        raise HTTPException(status_code=422, detail="Customer code must be exactly 4 digits.")

    combined = industry_code + customer_code
    existing = client.table("customer_codes").select("*").eq("combined", combined).maybe_single().execute()
    if response_data(existing):
        raise HTTPException(status_code=409, detail="This customer code already exists.")

    result = client.table("customer_codes").insert(
        {"industry_code": industry_code, "customer_code": customer_code, "combined": combined}
    ).execute()
    rows = response_data(result) or []
    return rows[0] if rows else {"combined": combined}


@router.get("/customers")
def list_customers(
    _: Any = Depends(get_current_user),
    client: Any = Depends(get_database_client),
) -> List[Dict[str, Any]]:
    result = client.table("customers").select("*").order("created_at", desc=True).execute()
    return response_data(result) or []


@router.post("/customers", status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: CustomerCreate,
    user: Any = Depends(get_current_user),
    client: Any = Depends(get_database_client),
) -> Dict[str, Any]:
    valid_code = client.table("customer_codes").select("combined").eq("combined", payload.customer_code).maybe_single().execute()
    if not response_data(valid_code):
        raise HTTPException(status_code=422, detail="Customer code is not valid.")

    body = payload.model_dump()
    body["created_by"] = getattr(user, "id", None)
    result = client.table("customers").insert(body).execute()
    rows = response_data(result) or []
    return rows[0] if rows else body
