import os

import streamlit as st
from supabase import Client, create_client

from dotenv import load_dotenv

load_dotenv()


@st.cache_resource
def get_supabase_client(url: str, key: str) -> Client:
    return create_client(url, key)


def get_setting(name: str) -> str | None:
    value = os.getenv(name)
    if value:
        return value

    try:
        return st.secrets[name]
    except Exception:
        return None


def get_current_user(supabase: Client):
    try:
        return supabase.auth.get_user().user
    except Exception:
        return None


def is_user_approved(supabase: Client, user) -> bool:
    if not user:
        return False

    try:
        access = (
            supabase.table("user_access")
            .select("approved")
            .eq("user_id", user.id)
            .maybe_single()
            .execute()
        )
        return bool(access.data and access.data["approved"] is True)
    except Exception:
        return False


def has_approved_session() -> bool:
    url = get_setting("SUPABASE_URL")
    key = get_setting("SUPABASE_KEY")
    if not url or not key:
        return False

    supabase = get_supabase_client(url, key)
    return is_user_approved(supabase, get_current_user(supabase))
