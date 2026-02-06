-- Migration: Fix HIGH Severity Issues
-- Description: Addresses remaining HIGH severity issues from database audit:
--   1. Missing UPDATE policy on payments table
--   2. Drop unused enum types
--   3. Sync vat_amount/tax_amount columns
--   4. Add updated_at to payments table

-- ============================================================================
-- HIGH FIX #1: Missing UPDATE policy on payments table
-- ============================================================================

CREATE POLICY "Users can update payments for their own invoices" ON public.payments
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = payments.invoice_id
            AND invoices.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = payments.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );


-- ============================================================================
-- HIGH FIX #2: Drop unused/legacy enum types
-- ============================================================================

DROP TYPE IF EXISTS public.invoice_type_v2;


-- ============================================================================
-- HIGH FIX #3: Standardize column naming (vat_amount vs tax_amount)
-- ============================================================================
-- Keep them in sync via trigger for backward compatibility

CREATE OR REPLACE FUNCTION public.sync_tax_vat_amounts()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF NEW.vat_amount IS NOT NULL AND (NEW.tax_amount IS NULL OR NEW.tax_amount != NEW.vat_amount) THEN
        NEW.tax_amount := NEW.vat_amount;
    ELSIF NEW.tax_amount IS NOT NULL AND NEW.vat_amount IS NULL THEN
        NEW.vat_amount := NEW.tax_amount;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_invoice_tax_vat ON public.invoices;
CREATE TRIGGER sync_invoice_tax_vat
    BEFORE INSERT OR UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_tax_vat_amounts();

COMMENT ON FUNCTION public.sync_tax_vat_amounts() IS 
    'Keeps vat_amount and tax_amount columns in sync for backward compatibility';


-- ============================================================================
-- HIGH FIX #4: Add updated_at to payments table (consistency)
-- ============================================================================

ALTER TABLE public.payments 
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
