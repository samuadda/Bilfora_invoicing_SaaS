-- Add brand_color column to invoice_settings table
ALTER TABLE public.invoice_settings
ADD COLUMN IF NOT EXISTS brand_color text DEFAULT '#7f2dfb';
