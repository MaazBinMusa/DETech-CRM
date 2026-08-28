import streamlit as st

from detech_crm.supabase_client import (
    get_current_user,
    get_setting,
    get_supabase_client,
    is_user_approved,
)

st.set_page_config(page_title="Customer codes | DETech CRM", page_icon="+")


st.title("Customer codes")
st.caption("Create a new valid customer code for an industry.")

url = get_setting("SUPABASE_URL")
key = get_setting("SUPABASE_KEY")

if not url or not key:
    st.error("Supabase is not configured.")
    st.info("Add SUPABASE_URL and SUPABASE_KEY under Manage app > Settings > Secrets in Streamlit Cloud.")
    st.stop()

supabase = get_supabase_client(url, key)
user = get_current_user(supabase)

if not is_user_approved(supabase, user):
    st.warning("Please log in with an approved account to manage customer codes.")
    st.stop()

with st.form("customer_code_form"):
    industry = st.text_input("Industry", placeholder="e.g. Construction")
    submitted = st.form_submit_button("Generate code", type="primary", use_container_width=True)

if submitted:
    cleaned = "".join(ch for ch in (industry or "").strip() if ch.isalnum())
    if len(cleaned) < 2:
        st.warning("Industry must include at least two valid alphanumeric characters.")
        st.stop()

    industry_code = cleaned[:2].upper()

    try:
        existing = (
            supabase.table("customer_codes")
            .select("customer_code")
            .eq("industry_code", industry_code)
            .execute()
        )

        max_index = 0
        for row in existing.data or []:
            code_value = str(row.get("customer_code") or "")
            if code_value.isdigit():
                max_index = max(max_index, int(code_value))

        next_index = max_index + 1
        customer_code = f"{next_index:04d}"
        combined_code = f"{industry_code}{customer_code}"

        insert_response = supabase.table("customer_codes").insert(
            {
                "industry_code": industry_code,
                "customer_code": customer_code,
                "combined": combined_code,
            }
        ).execute()

        if insert_response.data:
            st.success(f"New customer code created: {combined_code}")
            st.info("You can now return to the Customer page and assign this code to a customer.")
        else:
            st.error("The code could not be created.")
    except Exception as error:
        st.error("Unable to create a new customer code.")
        st.caption(str(error))

st.subheader("Current available codes")
try:
    codes = (
        supabase.table("customer_codes")
        .select("industry_code, customer_code, combined")
        .order("combined")
        .execute()
    )

    if codes.data:
        st.dataframe(codes.data, use_container_width=True, hide_index=True)
    else:
        st.info("No customer codes have been created yet.")
except Exception as error:
    st.info("The customer_codes table has not been created yet.")
    st.caption(str(error))
