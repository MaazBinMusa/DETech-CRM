-- Clear CRM business data for a fresh start.
-- This intentionally preserves auth.users and user_access so login/access remains intact.
-- Run in Supabase Dashboard > SQL Editor.

truncate table
    public.quotations,
    public.customers,
    public.customer_codes,
    public.summary_2026
restart identity;