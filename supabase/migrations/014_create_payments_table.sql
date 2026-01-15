-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'card', 'check', 'other')),
    reference_number TEXT,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_created_by ON payments(created_by);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view payments for their own invoices (via invoice ownership)
CREATE POLICY "Users can view payments for their own invoices" ON payments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = payments.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

-- Users can insert payments for their own invoices
CREATE POLICY "Users can create payments for their own invoices" ON payments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = payment_id  -- Note: using payment_id is wrong here, it should be the new row's invoice_id
            -- Wait, in WITH CHECK, we can reference the new row columns directly
        )
    );
    
-- Correction for INSERT policy:
DROP POLICY IF EXISTS "Users can create payments for their own invoices" ON payments;
CREATE POLICY "Users can create payments for their own invoices" ON payments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = payments.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

-- Users can delete their own payments
CREATE POLICY "Users can delete their own payments" ON payments
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = payments.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );
