-- Create the quotation records used by the new CRM page.
-- Run this once in Supabase Dashboard > SQL Editor.

create table if not exists public.quotations (
    id uuid primary key default gen_random_uuid(),
    customer_name text not null,
    rfq_description text not null,
    rfq_date date not null,
    due_date date,
    status text not null,
    po_status text,
    po_amount numeric(14, 2),
    bid_security numeric(14, 2),
    remarks text,
    created_by uuid references auth.users(id),
    created_at timestamptz not null default now()
);

create index if not exists quotations_customer_name_idx
    on public.quotations(customer_name);

create index if not exists quotations_rfq_date_idx
    on public.quotations(rfq_date desc);
