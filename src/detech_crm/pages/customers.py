import re

import streamlit as st

from detech_crm.supabase_client import (
    get_current_user,
    get_setting,
    get_supabase_client,
    is_user_approved,
)

st.set_page_config(page_title="Customers | DETech CRM", page_icon="+")


def normalize_industry_code(industry: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9]", "", (industry or "").strip())
    if not cleaned:
        raise ValueError("Please enter the customer's industry.")

    prefix = cleaned[:2].upper()
    if len(prefix) < 2:
        raise ValueError("Industry must provide at least two valid characters.")
    return prefix


def generate_customer_code(supabase, industry: str) -> str:
    industry_code = normalize_industry_code(industry)

    try:
        response = supabase.rpc("generate_customer_code", {"p_industry": industry}).execute()
        code = response.data
        if code:
            return str(code)
    except Exception:
        pass

    try:
        existing_rows = (
            supabase.table("customer_codes")
            .select("customer_code")
            .eq("industry_code", industry_code)
            .execute()
        )

        max_index = 0
        for row in existing_rows.data or []:
            code_value = str(row.get("customer_code") or "")
            if code_value.isdigit():
                max_index = max(max_index, int(code_value))

        next_index = max_index + 1
        customer_code = f"{next_index:04d}"
        combined_code = f"{industry_code}{customer_code}"

        supabase.table("customer_codes").insert(
            {
                "industry_code": industry_code,
                "customer_code": customer_code,
                "combined": combined_code,
            }
        ).execute()

        return combined_code
    except Exception as error:
        raise RuntimeError(f"Unable to generate the customer code: {error}") from error


st.title("Customers")
st.caption("Add a client and assign a unique customer code. The customer row references the code in the code table.")

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

with st.form("customer_form"):
    customer_name = st.text_input("Customer name", placeholder="e.g. Northwind Steel")
    contact_name = st.text_input("Contact name", placeholder="e.g. Maya Patel")
    industry = st.text_input("Industry", placeholder="e.g. Construction")
    email = st.text_input("Email", placeholder="name@company.com")
    phone = st.text_input("Phone", placeholder="+1 555 123 4567")
    notes = st.text_area("Notes", placeholder="Optional project or account notes")
    submitted = st.form_submit_button("Save customer", type="primary", use_container_width=True)

if submitted:
    try:
        if not customer_name.strip():
            st.warning("Customer name is required.")
            st.stop()

        customer_code = generate_customer_code(supabase, industry)

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
        if insert_response.data:
            st.success(f"Customer saved successfully with code: {customer_code}")
            st.json(insert_response.data[0], expanded=False)
        else:
            st.error("The customer could not be saved.")
    except ValueError as error:
        st.warning(str(error))
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

    if recent.data:
        st.dataframe(recent.data, use_container_width=True, hide_index=True)
    else:
        st.info("No customers have been added yet.")
except Exception as error:
    st.info("The customers table has not been created yet. Use the SQL schema in the project to create it.")
    st.caption(str(error))
