-- Add missing email and phone columns to invoice_settings
ALTER TABLE public.invoice_settings
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text;
