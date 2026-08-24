import os

import streamlit as st
from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

st.set_page_config(page_title="Create account | DETech CRM", page_icon="+")


@st.cache_resource
def get_supabase_client(url: str, key: str) -> Client:
    return create_client(url, key)


st.title("Create your account")
st.caption("Join DETech CRM to manage your customer relationships.")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    st.error("Supabase is not configured. Add SUPABASE_URL and SUPABASE_KEY to your .env file.")
    st.stop()

with st.form("signup_form"):
    full_name = st.text_input("Full name", placeholder="Ada Lovelace")
    email = st.text_input("Email address", placeholder="ada@example.com")
    password = st.text_input("Password", type="password", help="Use at least 6 characters.")
    confirm_password = st.text_input("Confirm password", type="password")
    submitted = st.form_submit_button("Create account", type="primary", use_container_width=True)

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
                st.success(f"Account created. Check your email to confirm your account. {response.user.email}")
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
