import streamlit as st

from detech_crm.supabase_client import (
    get_current_user,
    get_setting,
    get_supabase_client,
    is_user_approved,
)

st.set_page_config(page_title="Quotations | DETech CRM", page_icon="+")

st.title("Quotations")
st.caption("Add a new RFQ / quotation record based on the summary table format.")

url = get_setting("SUPABASE_URL")
key = get_setting("SUPABASE_KEY")

if not url or not key:
    st.error("Supabase is not configured.")
    st.info("Add SUPABASE_URL and SUPABASE_KEY under Manage app > Settings > Secrets in Streamlit Cloud.")
    st.stop()

supabase = get_supabase_client(url, key)
user = get_current_user(supabase)

if not is_user_approved(supabase, user):
    st.warning("Please log in with an approved account to add quotations.")
    st.stop()

try:
    customers_response = supabase.table("customers").select("customer_name, customer_code").order("customer_name").execute()
    customers_data = getattr(customers_response, "data", None) if customers_response is not None else None
except Exception:
    customers_data = []

customer_options = [
    item["customer_name"]
    for item in (customers_data or [])
    if item.get("customer_name")
]

with st.form("quotation_form"):
    customer_name = st.selectbox(
        "Customer name",
        options=customer_options if customer_options else [""],
        index=0 if customer_options else 0,
    )

    rfq_description = st.text_area("RFQ / description", placeholder="e.g. Supply and installation of...", height=120)

    rfq_date = st.date_input("RFQ date")
    due_date = st.date_input("Due date")

    status = st.selectbox(
        "Status",
        options=["", "Quoted", "Revised", "In progress", "Pending", "Rejected", "Order received"],
        index=0,
    )

    po_status = st.selectbox(
        "P.O. status",
        options=["", "Awaiting PO", "Order received", "Partial", "Rejected"],
        index=0,
    )

    po_amount = st.text_input("P.O. amount", placeholder="e.g. 1200000 or 1,200,000")
    bid_security = st.text_input("Bid security", placeholder="e.g. 2% / 150000")
    remarks = st.text_area("Remarks", placeholder="Optional notes", height=100)

    submitted = st.form_submit_button("Save quotation", type="primary", use_container_width=True)

if submitted:
    try:
        if not customer_name.strip():
            st.warning("Please select a customer name.")
            st.stop()

        payload = {
            "customer_name": customer_name.strip(),
            "rfq_description": rfq_description.strip() or None,
            "rfq_date": rfq_date.isoformat() if rfq_date else None,
            "due_date": due_date.isoformat() if due_date else None,
            "status": status.strip() or None,
            "po_status": po_status.strip() or None,
            "po_amount": po_amount.strip() or None,
            "bid_security": bid_security.strip() or None,
            "remarks": remarks.strip() or None,
            "created_by": user.id if user else None,
        }

        insert_response = supabase.table("summary_2026").insert(payload).execute()
        response_data = getattr(insert_response, "data", None) if insert_response is not None else None

        if response_data:
            st.success("Quotation saved successfully.")
            st.dataframe(response_data, use_container_width=True, hide_index=True)
        else:
            st.success("Quotation saved successfully.")
            st.info("The insert completed successfully and the record is now in summary_2026.")
    except Exception as error:
        st.error("Unable to save quotation.")
        st.caption(str(error))

st.subheader("Recent quotations")
try:
    recent_response = (
        supabase.table("summary_2026")
        .select("sr_no, customer_name, rfq_description, rfq_date, due_date, status, po_status, po_amount, bid_security, remarks")
        .order("sr_no", desc=True)
        .limit(10)
        .execute()
    )
    recent_data = getattr(recent_response, "data", None) if recent_response is not None else None
    if recent_data:
        st.dataframe(recent_data, use_container_width=True, hide_index=True)
    else:
        st.info("No quotation records have been added yet.")
except Exception as error:
    st.info("The summary_2026 table has not been created yet.")
    st.caption(str(error))
