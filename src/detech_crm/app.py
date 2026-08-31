import streamlit as st
from detech_crm.supabase_client import has_approved_session

st.set_page_config(page_title="DETech CRM", page_icon="+")

st.markdown(
    """
    <style>
        :root {
            --app-bg: #f8fafc;
            --app-bg-strong: #eef4ff;
            --panel-bg: rgba(255, 255, 255, 0.82);
            --panel-border: rgba(148, 163, 184, 0.25);
            --text: #0f172a;
            --muted: #475569;
            --header: #0f172a;
            --button-bg: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
            --button-border: rgba(37, 99, 235, 0.25);
            --input-bg: rgba(255, 255, 255, 0.9);
            --input-border: rgba(148, 163, 184, 0.5);
            --shadow: rgba(37, 99, 235, 0.12);
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --app-bg: #0b1220;
                --app-bg-strong: #111827;
                --panel-bg: rgba(15, 23, 42, 0.82);
                --panel-border: rgba(148, 163, 184, 0.2);
                --text: #e5eefb;
                --muted: #a7b7d0;
                --header: #f8fbff;
                --button-bg: linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%);
                --button-border: rgba(94, 234, 212, 0.25);
                --input-bg: rgba(17, 24, 39, 0.75);
                --input-border: rgba(148, 163, 184, 0.3);
                --shadow: rgba(14, 165, 233, 0.18);
            }
        }

        .stApp {
            background: linear-gradient(180deg, var(--app-bg) 0%, var(--app-bg-strong) 100%);
            color: var(--text);
        }

        [data-testid="stHeader"] {
            background: rgba(15, 23, 42, 0.12);
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
            border: 1px solid var(--button-border);
            background: var(--button-bg);
            color: #ffffff;
            font-weight: 600;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            box-shadow: 0 8px 16px var(--shadow);
        }

        .stButton > button:hover,
        .stDownloadButton > button:hover,
        .stFormSubmitButton > button:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 18px var(--shadow);
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
            background: var(--input-bg);
            color: var(--text);
            border: 1px solid var(--input-border);
        }

        .stDataFrame {
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid var(--panel-border);
        }

        h1, h2, h3 {
            color: var(--header);
        }

        .stSidebar {
            background: var(--panel-bg);
            border-right: 1px solid var(--panel-border);
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
