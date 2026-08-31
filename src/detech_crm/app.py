import streamlit as st
from detech_crm.supabase_client import has_approved_session

st.set_page_config(page_title="DETech CRM", page_icon="+")

st.markdown(
    """
    <style>
        body {
            color-scheme: light dark;
        }

        .stApp {
            background: transparent;
        }

        .block-container {
            padding-top: 2rem;
            padding-bottom: 3rem;
        }

        .stButton > button,
        .stDownloadButton > button,
        .stFormSubmitButton > button {
            border-radius: 12px;
            border: 1px solid rgba(37, 99, 235, 0.25);
            background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
            color: white;
            font-weight: 600;
            box-shadow: 0 8px 16px rgba(37, 99, 235, 0.18);
        }

        .stButton > button:hover,
        .stDownloadButton > button:hover,
        .stFormSubmitButton > button:hover {
            filter: brightness(1.04);
        }

        .stAlert,
        .stDataFrame,
        .stTextInput > div > div > input,
        .stTextArea > div > div > textarea,
        .stSelectbox > div > div > select,
        .stDateInput > div > div > input,
        .stNumberInput > div > div > input {
            border-radius: 12px;
        }
    </style>
    """,
    unsafe_allow_html=True,
)


if has_approved_session():
    pages = {
        "CRM": [
            st.Page("pages/summary.py", title="Summary 2026", default=True),
            st.Page("pages/customers.py", title="Customers"),
            st.Page("pages/customer_codes.py", title="Customer codes"),
            st.Page("pages/quotations.py", title="Quotations"),
            st.Page("pages/reports.py", title="Reports"),
            st.Page("pages/about.py", title="About Us"),
        ]
    }
else:
    pages = {"Account": [st.Page("pages/login.py", title="Log in", default=True)]}

st.navigation(pages).run()
