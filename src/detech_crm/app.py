import streamlit as st
st.set_page_config(page_title="DETech CRM", page_icon="+")

pages = [
    st.Page("pages/login.py", title="Log in", default=True),
    st.Page("pages/summary.py", title="Summary 2026"),
]

st.navigation(pages).run()
