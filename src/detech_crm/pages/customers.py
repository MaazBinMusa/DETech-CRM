import streamlit as st

from detech_crm.supabase_client import (
    get_current_user,
    get_setting,
    get_supabase_client,
    is_user_approved,
)

st.set_page_config(page_title="Customers | DETech CRM", page_icon="+")


def get_available_customer_codes(supabase):
    try:
        all_codes = supabase.table("customer_codes").select("combined").order("combined").execute()
        used_codes = supabase.table("customers").select("customer_code").execute()

        all_response = getattr(all_codes, "data", None) if all_codes is not None else None
        used_response = getattr(used_codes, "data", None) if used_codes is not None else None

        all_values = {item["combined"] for item in (all_response or []) if item.get("combined")}
        used_values = {item["customer_code"] for item in (used_response or []) if item.get("customer_code")}
        return sorted(all_values - used_values)
    except Exception:
        return []


st.title("Customers")
st.caption("Choose an available customer code from the code table, then add the customer details.")

url = get_setting("SUPABASE_URL")
key = get_setting("SUPABASE_KEY")

if not url or not key:
    st.error("Supabase is not configured.")
    st.info("Add SUPABASE_URL and SUPABASE_KEY under Manage app > Settings > Secrets in Streamlit Cloud.")
    st.stop()

supabase = get_supabase_client(url, key)
user = get_current_user(supabase)

if not is_user_approved(supabase, user):
    st.warning("Please log in with an approved account to add a customer.")
    st.stop()

available_codes = get_available_customer_codes(supabase)

with st.form("customer_form"):
    customer_name = st.text_input("Customer name", placeholder="e.g. Northwind Steel")
    contact_name = st.text_input("Contact name", placeholder="e.g. Maya Patel")
    industry = st.text_input("Industry", placeholder="e.g. Construction")

    if available_codes:
        customer_code = st.selectbox(
            "Available customer code",
            options=available_codes,
            index=0,
        )
        code_col, save_col = st.columns([1.2, 2.6])
        with code_col:
            add_code_requested = st.form_submit_button("Add code", use_container_width=True)
        with save_col:
            submitted = st.form_submit_button("Save customer", type="primary", use_container_width=True)
    else:
        st.warning("There are no unused customer codes available. Any information entered on this page may be lost if you leave it.")
        add_code_requested = st.form_submit_button("Add new customer code", type="primary", use_container_width=True)
        customer_code = ""
        submitted = False

    email = st.text_input("Email", placeholder="name@company.com")
    phone = st.text_input("Phone", placeholder="+1 555 123 4567")
    notes = st.text_area("Notes", placeholder="Optional project or account notes")

if add_code_requested:
    st.switch_page("pages/customer_codes.py")

if submitted:
    try:
        if not customer_name.strip():
            st.warning("Customer name is required.")
            st.stop()

        if not available_codes:
            st.warning("No valid customer code is available to assign.")
            st.stop()

        payload = {
            "customer_name": customer_name.strip(),
            "contact_name": contact_name.strip() or None,
            "industry": industry.strip(),
            "customer_code": customer_code,
            "email": email.strip() or None,
            "phone": phone.strip() or None,
            "notes": notes.strip() or None,
            "created_by": user.id if user else None,
        }

        insert_response = supabase.table("customers").insert(payload).execute()
        response_data = getattr(insert_response, "data", None) if insert_response is not None else None

        if response_data is not None:
            st.success(f"Customer saved successfully with code: {customer_code}")
            st.dataframe(response_data, use_container_width=True, hide_index=True)
        else:
            st.success(f"Customer saved successfully with code: {customer_code}")
            st.info("The insert completed successfully, and the record is now available in the customer table.")
    except Exception as error:
        st.error("Unable to save the customer.")
        st.caption(str(error))

st.subheader("Recent customers")
try:
    recent = (
        supabase.table("customers")
        .select("customer_name, customer_code, industry, email, phone, created_at")
        .order("created_at", desc=True)
        .limit(10)
        .execute()
    )

    recent_data = getattr(recent, "data", None) if recent is not None else None
    if recent_data:
        st.dataframe(recent_data, use_container_width=True, hide_index=True)
    else:
        st.info("No customers have been added yet.")
except Exception as error:
    st.info("The customers table has not been created yet. Use the SQL schema in the project to create it.")
    st.caption(str(error))
