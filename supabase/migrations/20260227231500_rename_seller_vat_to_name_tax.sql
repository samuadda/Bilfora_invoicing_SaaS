-- Rename legacy columns in invoice_settings to match new Supabase TS types
ALTER TABLE public.invoice_settings RENAME COLUMN seller_name TO name;
ALTER TABLE public.invoice_settings RENAME COLUMN vat_number TO tax_number;
