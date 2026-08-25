import os

import streamlit as st
from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

st.set_page_config(page_title="DETech CRM", page_icon="+")


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


def has_approved_session() -> bool:
    url = get_setting("SUPABASE_URL")
    key = get_setting("SUPABASE_KEY")
    if not url or not key:
        return False

    try:
        supabase = get_supabase_client(url, key)
        user = supabase.auth.get_user().user
        if not user:
            return False
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


if has_approved_session():
    pages = [st.Page("pages/summary.py", title="Summary 2026", default=True)]
else:
    pages = [st.Page("pages/login.py", title="Log in", default=True)]

st.navigation(pages).run()
