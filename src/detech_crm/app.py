import streamlit as st

st.set_page_config(page_title="DETech CRM", page_icon="+")

pages = {
    "Account": [st.Page("pages/login.py", title="Log in", default=True)],
    "CRM": [st.Page("pages/summary.py", title="Summary 2026")],
}

st.navigation(pages, position="hidden").run()
