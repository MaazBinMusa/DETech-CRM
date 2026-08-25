import pandas as pd
import streamlit as st

from detech_crm.supabase_client import (
    get_current_user,
    get_setting,
    get_supabase_client,
    is_user_approved,
)

st.set_page_config(page_title="Reports | DETech CRM", page_icon="+")

st.title("Reports")
st.caption("A live view of RFQ activity and sales performance")

url = get_setting("SUPABASE_URL")
key = get_setting("SUPABASE_KEY")

if not url or not key:
    st.error("Supabase is not configured.")
    st.stop()

supabase = get_supabase_client(url, key)
if not is_user_approved(supabase, get_current_user(supabase)):
    st.warning("Please log in with an approved account to view this page.")
    st.stop()

try:
    response = supabase.table("summary_2026").select("*").execute()
    data = pd.DataFrame(response.data)
except Exception as error:
    st.error("The report data could not be loaded.")
    st.caption(str(error))
    st.stop()

if data.empty:
    st.info("There is no data in summary_2026 yet.")
    st.stop()

for column in ("customer_name", "status", "po_status"):
    data[column] = data[column].fillna("").astype(str).str.strip()

data["rfq_date_parsed"] = pd.to_datetime(data["rfq_date"], errors="coerce")
data["po_amount_number"] = (
    data["po_amount"].fillna("").astype(str).str.replace(",", "", regex=False).str.strip()
)
data["po_amount_number"] = pd.to_numeric(data["po_amount_number"], errors="coerce").fillna(0)
data = data[data["customer_name"].ne("") | data["rfq_description"].fillna("").astype(str).str.strip().ne("")]

st.sidebar.header("Report filters")
customer_options = sorted(value for value in data["customer_name"].unique() if value)
selected_customers = st.sidebar.multiselect("Customers", customer_options)
status_options = sorted(value for value in data["status"].unique() if value)
selected_statuses = st.sidebar.multiselect("Statuses", status_options)

filtered = data.copy()
if selected_customers:
    filtered = filtered[filtered["customer_name"].isin(selected_customers)]
if selected_statuses:
    filtered = filtered[filtered["status"].isin(selected_statuses)]

order_received = filtered["po_status"].str.lower().str.contains("order received", na=False)
quoted = filtered["status"].str.lower().str.contains("quot|revised", regex=True, na=False)

metric_one, metric_two, metric_three, metric_four = st.columns(4)
metric_one.metric("Total RFQs", len(filtered))
metric_two.metric("Quotations", int(quoted.sum()))
metric_three.metric("Orders received", int(order_received.sum()))
metric_four.metric("PO value", f"Rs. {filtered['po_amount_number'].sum():,.0f}")

st.subheader("RFQ activity by month")
monthly = (
    filtered.dropna(subset=["rfq_date_parsed"])
    .assign(month=lambda frame: frame["rfq_date_parsed"].dt.to_period("M").astype(str))
    .groupby("month")
    .size()
    .rename("RFQs")
)
if monthly.empty:
    st.info("No valid RFQ dates are available for the selected filters.")
else:
    st.line_chart(monthly)

left, right = st.columns(2)
with left:
    st.subheader("Workflow status")
    status_counts = filtered["status"].replace("", "Not specified").value_counts()
    st.bar_chart(status_counts)

with right:
    st.subheader("Top customers by RFQs")
    customer_counts = filtered["customer_name"].replace("", "Not specified").value_counts().head(10)
    st.bar_chart(customer_counts)

st.subheader("Customer order value")
customer_value = (
    filtered.assign(customer=filtered["customer_name"].replace("", "Not specified"))
    .groupby("customer")["po_amount_number"]
    .sum()
    .sort_values(ascending=False)
    .head(10)
    .rename("PO value")
)
if customer_value.empty or customer_value.eq(0).all():
    st.info("No purchase-order amounts are available for the selected filters.")
else:
    st.bar_chart(customer_value)

st.subheader("Filtered records")
visible_columns = [
    "sr_no",
    "customer_name",
    "rfq_description",
    "rfq_date",
    "due_date",
    "status",
    "po_status",
    "po_amount",
    "bid_security",
    "remarks",
]
st.dataframe(filtered[visible_columns], use_container_width=True, hide_index=True)
st.download_button(
    "Download filtered report",
    filtered[visible_columns].to_csv(index=False).encode("utf-8"),
    "summary-2026-report.csv",
    "text/csv",
)
