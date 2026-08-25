import streamlit as st
from detech_crm.supabase_client import (
    get_current_user,
    get_setting,
    get_supabase_client,
    is_user_approved,
)

st.set_page_config(page_title="About Us | DETech CRM", page_icon="+")


st.title("About Us")

url = get_setting("SUPABASE_URL")
key = get_setting("SUPABASE_KEY")

if not url or not key:
    st.error("Supabase is not configured.")
    st.stop()

supabase = get_supabase_client(url, key)
user = get_current_user(supabase)

if not is_user_approved(supabase, user):
    st.warning("Please log in with an approved account to view this page.")
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