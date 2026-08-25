import os

import streamlit as st
from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

st.set_page_config(page_title="About Us | DETech CRM", page_icon="+")


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


st.title("About Us")

url = get_setting("SUPABASE_URL")
key = get_setting("SUPABASE_KEY")

if not url or not key:
    st.error("Supabase is not configured.")
    st.stop()

supabase = get_supabase_client(url, key)
try:
    user = supabase.auth.get_user().user
except Exception:
    user = None

access = (
    supabase.table("user_access")
    .select("approved")
    .eq("user_id", user.id)
    .maybe_single()
    .execute()
) if user else None

if not user or not access or not access.data or access.data["approved"] is not True:
    st.warning("Please log in with an approved account to view this page.")
    if st.button("Go to login"):
        st.switch_page("pages/login.py")
    st.stop()

st.subheader("Building better customer relationships")
st.write(
    "DETech CRM helps teams organize customer information, track requests, and keep important "
    "sales activity in one place. Our goal is to make day-to-day customer management clear, "
    "consistent, and easy to follow."
)
st.write(
    "We are committed to practical tools, dependable information, and a straightforward experience "
    "that helps teams spend less time searching and more time serving their customers."
)