from __future__ import annotations

from typing import Any

from supabase import Client, create_client

from app.config import get_settings


def get_supabase_client() -> Client:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise ValueError("Supabase URL and anon key are required.")

    return create_client(settings.supabase_url, settings.supabase_anon_key)


def get_service_supabase_client() -> Client:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise ValueError("Supabase service role key is required.")

    return create_client(settings.supabase_url, settings.supabase_service_role_key)
