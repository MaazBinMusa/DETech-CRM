import streamlit as st
from detech_crm.supabase_client import has_approved_session

st.set_page_config(page_title="DETech CRM", page_icon="+")

st.markdown(
    """
    <style>
        :root {
            --bg: #0b1220;
            --panel: #121c2d;
            --panel-strong: #16233a;
            --accent: #5eead4;
            --accent-2: #60a5fa;
            --text: #e5eefb;
            --muted: #a7b7d0;
            --success: #34d399;
            --warning: #fbbf24;
            --danger: #f87171;
        }

        .stApp {
            background: linear-gradient(180deg, #0b1220 0%, #111827 100%);
            color: var(--text);
        }

        [data-testid="stHeader"] {
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(8px);
        }

        .block-container {
            padding-top: 2rem;
            padding-bottom: 3rem;
        }

        div[data-testid="stVerticalBlock"] > div > div {
            border-radius: 16px;
        }

        .stButton > button,
        .stDownloadButton > button,
        .stFormSubmitButton > button {
            border-radius: 12px;
            border: 1px solid rgba(94, 234, 212, 0.25);
            background: linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%);
            color: white;
            font-weight: 600;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            box-shadow: 0 8px 16px rgba(14, 165, 233, 0.18);
        }

        .stButton > button:hover,
        .stDownloadButton > button:hover,
        .stFormSubmitButton > button:hover {
            transform: translateY(-1px);
            box-shadow: 0 12px 20px rgba(14, 165, 233, 0.25);
        }

        .stAlert {
            border-radius: 12px;
        }

        .stTextInput > div > div > input,
        .stTextArea > div > div > textarea,
        .stSelectbox > div > div > select,
        .stDateInput > div > div > input,
        .stNumberInput > div > div > input {
            border-radius: 10px;
            background: rgba(17, 24, 39, 0.75);
            color: var(--text);
            border: 1px solid rgba(148, 163, 184, 0.3);
        }

        .stDataFrame {
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid rgba(148, 163, 184, 0.2);
        }

        h1, h2, h3 {
            color: #f8fbff;
        }

        .stSidebar {
            background: rgba(15, 23, 42, 0.9);
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
