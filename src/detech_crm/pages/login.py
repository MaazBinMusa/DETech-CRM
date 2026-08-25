import os

import streamlit as st
from dotenv import load_dotenv
from supabase import Client, create_client

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


st.title("DETech CRM")
st.caption("Sign in to continue, or request access to create an account.")

url = get_setting("SUPABASE_URL")
key = get_setting("SUPABASE_KEY")

if not url or not key:
    st.error("Supabase is not configured.")
    st.info("Add SUPABASE_URL and SUPABASE_KEY under Manage app > Settings > Secrets in Streamlit Cloud.")
    st.stop()

supabase = get_supabase_client(url, key)
try:
    current_user = supabase.auth.get_user().user
except Exception:
    current_user = None

if current_user:
    current_access = (
        supabase.table("user_access")
        .select("approved")
        .eq("user_id", current_user.id)
        .maybe_single()
        .execute()
    )
    if current_access.data and current_access.data["approved"] is True:
        st.session_state.authenticated = True
        st.session_state.user_email = current_user.email
        st.switch_page("pages/summary.py")

login_tab, signup_tab = st.tabs(["Log in", "Request access"])

with login_tab:
    with st.form("login_form"):
        login_email = st.text_input("Email address", key="login_email")
        login_password = st.text_input("Password", type="password", key="login_password")
        login_submitted = st.form_submit_button("Log in", type="primary", use_container_width=True)

    if login_submitted:
        if not login_email or not login_password:
            st.warning("Enter your email and password.")
        else:
            try:
                response = supabase.auth.sign_in_with_password(
                    {"email": login_email.strip(), "password": login_password}
                )
                user = response.user
                access = (
                    supabase.table("user_access")
                    .select("approved")
                    .eq("user_id", user.id)
                    .maybe_single()
                    .execute()
                ) if user else None
                if user and access and access.data and access.data["approved"] is True:
                    st.session_state.authenticated = True
                    st.session_state.user_email = user.email
                    st.switch_page("pages/summary.py")
                else:
                    supabase.auth.sign_out()
                    st.warning("Your account is awaiting approval.")
            except Exception as error:
                st.error(f"Login failed: {error}")

with signup_tab:
    with st.form("signup_form"):
        full_name = st.text_input("Full name", placeholder="Ada Lovelace")
        email = st.text_input("Email address", placeholder="ada@example.com")
        password = st.text_input("Password", type="password", help="Use at least 6 characters.")
        confirm_password = st.text_input("Confirm password", type="password")
        submitted = st.form_submit_button("Request access", type="primary", use_container_width=True)

if submitted:
    full_name = full_name.strip()
    email = email.strip()

    if not full_name or not email or not password or not confirm_password:
        st.warning("Please complete every field.")
    elif len(password) < 6:
        st.warning("Your password must be at least 6 characters.")
    elif password != confirm_password:
        st.warning("Passwords do not match.")
    else:
        try:
            supabase = get_supabase_client(url, key)
            response = supabase.auth.sign_up(
                {
                    "email": email,
                    "password": password,
                    "options": {"data": {"full_name": full_name}},
                }
            )

            if response.user:
                supabase.auth.sign_out()
                st.success("Access requested. Confirm your email, then wait for administrator approval.")
            else:
                st.error("We could not create your account. Please try again.")
        except Exception as error:
            error_message = str(error)
            if "rate limit" in error_message.lower() or "rate_limit" in error_message.lower():
                st.warning("Supabase has temporarily limited confirmation emails.")
                st.info(
                    "Wait before trying again, and check the inbox and spam folder for an existing "
                    "confirmation email. For local testing, disable email confirmation in Supabase "
                    "under Authentication > Providers > Email."
                )
            else:
                st.error(f"Signup failed: {error_message}")
