import streamlit as st

from detech_crm.supabase_client import get_setting, get_supabase_client

st.set_page_config(page_title="Summary 2026 | DETech CRM", page_icon="+")

st.markdown(
    """
    <style>
        #MainMenu, footer, [data-testid="stHeader"], [data-testid="stToolbar"], .stDeployButton {
            visibility: hidden;
            display: none;
        }
    </style>
    """,
    unsafe_allow_html=True,
)

st.title("Summary 2026")
st.caption("RFQ and sales summary")

url = get_setting("SUPABASE_URL")
key = get_setting("SUPABASE_KEY")

if not url or not key:
    st.error("Supabase is not configured.")
    st.info("Add SUPABASE_URL and SUPABASE_KEY under Manage app > Settings > Secrets in Streamlit Cloud.")
    st.stop()

if st.button("Refresh table"):
    st.cache_resource.clear()

try:
    response = (
        get_supabase_client(url, key)
        .table("summary_2026")
        .select("*")
        .order("sr_no")
        .execute()
    )
    st.dataframe(response.data, use_container_width=True, hide_index=True)
    st.caption(f"{len(response.data)} rows")
except Exception as error:
    st.error("The summary table could not be loaded.")
    st.info(
        "Check that summary_2026 exists and that Supabase Row Level Security allows "
        "read access for the app."
    )
    st.caption(str(error))
