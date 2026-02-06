-- Migration: Fix Critical Security Issues
-- Description: Addresses 3 critical issues from database audit:
--   1. recalc_invoice_totals missing ownership check
--   2. Duplicate triggers on invoice_items
--   3. Inconsistent FK reference in invoice_settings (cannot be fixed without data migration)

-- ============================================================================
-- CRITICAL FIX #1: Add ownership check to recalc_invoice_totals
-- ============================================================================
-- The function was SECURITY DEFINER but allowed ANY user to modify ANY invoice.
-- Adding auth.uid() validation to prevent unauthorized invoice tampering.

CREATE OR REPLACE FUNCTION public.recalc_invoice_totals(inv_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_subtotal numeric(12,2) := 0;
    v_tax_rate numeric := 0;
    v_invoice_type text;
BEGIN
    -- SECURITY: Verify the calling user owns this invoice
    IF NOT EXISTS (
        SELECT 1 FROM public.invoices 
        WHERE id = inv_id 
        AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access denied: User does not own this invoice';
    END IF;

    SELECT COALESCE(SUM(ii.quantity * ii.unit_price), 0)
    INTO v_subtotal
    FROM public.invoice_items ii
    WHERE ii.invoice_id = inv_id;

    SELECT COALESCE(tax_rate, 0), invoice_type::text 
    INTO v_tax_rate, v_invoice_type 
    FROM public.invoices WHERE id = inv_id;

    -- For non-tax invoices, set tax to 0
    IF v_invoice_type = 'non_tax' THEN
        UPDATE public.invoices
        SET subtotal = v_subtotal,
            vat_amount = 0,
            total_amount = v_subtotal,
            tax_rate = 0
        WHERE id = inv_id;
    ELSE
        UPDATE public.invoices
        SET subtotal = v_subtotal,
            vat_amount = v_subtotal * (v_tax_rate / 100.0),
            total_amount = v_subtotal * (1 + (v_tax_rate / 100.0))
        WHERE id = inv_id;
    END IF;
END;
$function$;

COMMENT ON FUNCTION public.recalc_invoice_totals(uuid) IS 
    'Recalculates invoice totals. SECURITY: Only allows invoice owner to call.';


-- ============================================================================
-- CRITICAL FIX #2: Remove duplicate trigger on invoice_items
-- ============================================================================
-- Two triggers were firing on invoice_items:
--   - update_invoice_totals_trigger (from 003_functions_triggers.sql)
--   - trg_invoice_items_recalc (from 004_invoice_totals_and_pdf.sql)
-- Both update the same columns, causing double calculation and potential issues.
-- Keeping trg_invoice_items_recalc as it's the newer, more complete implementation.

DROP TRIGGER IF EXISTS update_invoice_totals_trigger ON public.invoice_items;

-- Also drop the now-unused function to clean up
DROP FUNCTION IF EXISTS public.update_invoice_totals();
DROP FUNCTION IF EXISTS public.calculate_invoice_totals(uuid);

COMMENT ON TRIGGER trg_invoice_items_recalc ON public.invoice_items IS 
    'Automatically recalculates invoice totals when items are modified';


-- ============================================================================
-- CRITICAL FIX #3: Document invoice_settings FK issue
-- ============================================================================
-- NOTE: invoice_settings.user_id references auth.users(id) directly instead of 
-- profiles(id) like other tables. This cannot be fixed with a simple ALTER because:
--   1. We'd need to drop the existing FK constraint
--   2. Verify all existing user_ids have corresponding profile rows
--   3. Add new FK constraint
--
-- For now, we document this inconsistency. If you want to fix it, run:
--
-- ALTER TABLE public.invoice_settings 
--   DROP CONSTRAINT invoice_settings_user_id_fkey;
-- ALTER TABLE public.invoice_settings 
--   ADD CONSTRAINT invoice_settings_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
--
-- Only run this after verifying all invoice_settings.user_id values exist in profiles.


-- ============================================================================
-- ADDITIONAL: Fix trigger_recalc_invoice_totals to also validate ownership
-- ============================================================================
-- The trigger function calls recalc_invoice_totals which now has auth checks.
-- However, triggers run in a different auth context. We need to ensure the
-- trigger bypasses the auth check since it's system-initiated from item changes.

CREATE OR REPLACE FUNCTION public.trigger_recalc_invoice_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    target_id uuid;
    v_subtotal numeric(12,2) := 0;
    v_tax_rate numeric := 0;
    v_invoice_type text;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_id := OLD.invoice_id;
    ELSE
        target_id := NEW.invoice_id;
    END IF;

    -- Direct calculation without calling recalc_invoice_totals
    -- (avoids auth.uid() check which may be NULL in trigger context)
    SELECT COALESCE(SUM(ii.quantity * ii.unit_price), 0)
    INTO v_subtotal
    FROM public.invoice_items ii
    WHERE ii.invoice_id = target_id;

    SELECT COALESCE(tax_rate, 0), invoice_type::text 
    INTO v_tax_rate, v_invoice_type 
    FROM public.invoices WHERE id = target_id;

    IF v_invoice_type = 'non_tax' THEN
        UPDATE public.invoices
        SET subtotal = v_subtotal,
            vat_amount = 0,
            total_amount = v_subtotal,
            tax_rate = 0
        WHERE id = target_id;
    ELSE
        UPDATE public.invoices
        SET subtotal = v_subtotal,
            vat_amount = v_subtotal * (v_tax_rate / 100.0),
            total_amount = v_subtotal * (1 + (v_tax_rate / 100.0))
        WHERE id = target_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$function$;

COMMENT ON FUNCTION public.trigger_recalc_invoice_totals() IS 
    'Trigger function to recalculate invoice totals when items change. Runs as SECURITY DEFINER.';
