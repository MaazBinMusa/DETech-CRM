-- Restore backend access for the service_role used by FastAPI.
-- Run this once in Supabase Dashboard > SQL Editor.

grant usage on schema public to service_role;

grant select, insert, update, delete on table public.customers to service_role;
grant select, insert, update, delete on table public.customer_codes to service_role;
grant select, insert, update, delete on table public.summary_2026 to service_role;

grant usage, select on all sequences in schema public to service_role;