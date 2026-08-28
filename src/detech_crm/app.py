import streamlit as st
from detech_crm.supabase_client import has_approved_session

st.set_page_config(page_title="DETech CRM", page_icon="+")


if has_approved_session():
    pages = {
        "CRM": [
            st.Page("pages/summary.py", title="Summary 2026", default=True),
            st.Page("pages/customers.py", title="Customers"),
            st.Page("pages/customer_codes.py", title="Customer codes"),
            st.Page("pages/reports.py", title="Reports"),
            st.Page("pages/about.py", title="About Us"),
        ]
    }
else:
    pages = {"Account": [st.Page("pages/login.py", title="Log in", default=True)]}

st.navigation(pages).run()
