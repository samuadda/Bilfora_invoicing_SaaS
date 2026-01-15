-- Migration: Fix remaining search_path vulnerabilities
-- Description: Adds SET search_path = '' to generator functions to prevent path injection attacks

ALTER FUNCTION generate_invoice_number_text() SET search_path = '';
ALTER FUNCTION generate_order_number_text() SET search_path = '';
ALTER FUNCTION set_invoice_number() SET search_path = '';
ALTER FUNCTION set_order_number() SET search_path = '';
