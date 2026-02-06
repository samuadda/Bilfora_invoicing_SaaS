-- Migration: Fix Performance Advisor Issues
-- Description: Add missing FK indexes and consolidate clients RLS policies

-- Add missing FK indexes
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_related_invoice_id ON public.invoices(related_invoice_id);

-- Consolidate clients SELECT policies into one
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view own deleted clients" ON public.clients;

CREATE POLICY "Users can view own clients" ON public.clients
    FOR SELECT USING (auth.uid() = user_id);

-- Note: deleted_at filtering should be done at application layer
