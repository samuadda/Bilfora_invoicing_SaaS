-- Migration: Fix SECURITY DEFINER functions
-- Description: Explicitly set search_path to empty string for security definer functions to prevent search path injection

-- Fix handle_new_user (from 003_functions_triggers.sql)
ALTER FUNCTION handle_new_user() SET search_path = '';

-- Fix recalc_invoice_totals (from 004_invoice_totals_and_pdf.sql)
ALTER FUNCTION recalc_invoice_totals(uuid) SET search_path = '';

-- Fix trigger_recalc_invoice_totals (consistency)
ALTER FUNCTION trigger_recalc_invoice_totals() SET search_path = '';
