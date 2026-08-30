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
    industry_code = st.text_input("Industry code", max_chars=2, placeholder="e.g. CO")
    customer_code = st.text_input("Customer code", max_chars=4, placeholder="e.g. 0001")
    submitted = st.form_submit_button("Generate code", type="primary", use_container_width=True)

if submitted:
    industry_code = (industry_code or "").strip().upper()
    customer_code = (customer_code or "").strip()

    if len(industry_code) != 2 or not industry_code.isalpha():
        st.warning("Industry code must be exactly 2 letters only.")
        st.stop()

    if len(customer_code) != 4 or not customer_code.isdigit():
        st.warning("Customer code must be exactly 4 digits only.")
        st.stop()

    combined_code = f"{industry_code}{customer_code}"

    try:
        existing = (
            supabase.table("customer_codes")
            .select("combined")
            .eq("combined", combined_code)
            .maybe_single()
            .execute()
        )

        if existing.data:
            st.warning(f"This code already exists: {combined_code}")
            st.stop()

        insert_response = supabase.table("customer_codes").insert(
            {
                "industry_code": industry_code,
                "customer_code": customer_code,
            }
        ).execute()

        response_data = getattr(insert_response, "data", None) if insert_response is not None else None

        if response_data is not None:
            st.success(f"New customer code created: {combined_code}")
            st.info("You can now return to the Customer page and assign this code to a customer.")
        else:
            st.success(f"New customer code created: {combined_code}")
            st.info("The insert completed successfully, and the code is now available for customer creation.")
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

    if codes.data and len(codes.data) > 0:
        st.dataframe(codes.data, use_container_width=True, hide_index=True)
    else:
        st.info("No customer codes have been created yet.")
except Exception as error:
    st.info("The customer_codes table has not been created yet.")
    st.caption(str(error))
