-- Migration: Fix MEDIUM Severity Issues
-- Description: Addresses MEDIUM severity issues from database audit

-- ============================================================================
-- MEDIUM FIX #1: Change quantity to NUMERIC for fractional quantities
-- ============================================================================

ALTER TABLE public.invoice_items 
    ALTER COLUMN quantity TYPE NUMERIC(10,2);

ALTER TABLE public.order_items 
    ALTER COLUMN quantity TYPE NUMERIC(10,2);


-- ============================================================================
-- MEDIUM FIX #2: Add missing indexes for common query patterns
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON public.invoices(user_id, status);
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(name);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);


-- ============================================================================
-- MEDIUM FIX #3: Update clients RLS to filter soft-deleted records
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients" ON public.clients
    FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can view own deleted clients" ON public.clients
    FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NOT NULL);


-- ============================================================================
-- MEDIUM FIX #4: Add timestamps to order_items and invoice_items
-- ============================================================================

ALTER TABLE public.order_items 
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.invoice_items 
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DROP TRIGGER IF EXISTS update_order_items_updated_at ON public.order_items;
CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_items_updated_at ON public.invoice_items;
CREATE TRIGGER update_invoice_items_updated_at
    BEFORE UPDATE ON public.invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
