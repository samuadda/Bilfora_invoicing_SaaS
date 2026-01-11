-- Create invoice_type enum
DO $$ BEGIN
    CREATE TYPE invoice_type AS ENUM (
        'standard_tax',
        'simplified_tax',
        'non_tax'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create document_kind enum
DO $$ BEGIN
    CREATE TYPE document_kind AS ENUM (
        'invoice',
        'credit_note'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add columns to invoices table
ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS type invoice_type NOT NULL DEFAULT 'standard_tax',
    ADD COLUMN IF NOT EXISTS document_kind document_kind NOT NULL DEFAULT 'invoice',
    ADD COLUMN IF NOT EXISTS related_invoice_id uuid NULL REFERENCES invoices(id);

-- Update recalc_invoice_totals function to handle non-tax invoices
CREATE OR REPLACE FUNCTION public.recalc_invoice_totals(inv_id uuid)
RETURNS void AS $$
DECLARE
    v_subtotal numeric(12,2) := 0;
    v_tax_rate numeric := 0;
    v_invoice_type invoice_type;
BEGIN
    -- Verify ownership securely
    IF NOT EXISTS (
        SELECT 1 FROM invoices 
        WHERE id = inv_id 
        AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access denied: User does not own this invoice';
    END IF;

    SELECT COALESCE(SUM(ii.quantity * ii.unit_price), 0)
    INTO v_subtotal
    FROM invoice_items ii
    WHERE ii.invoice_id = inv_id;

    SELECT COALESCE(tax_rate, 0), type INTO v_tax_rate, v_invoice_type 
    FROM invoices WHERE id = inv_id;

    -- For non-tax invoices, set tax to 0
    IF v_invoice_type = 'non_tax' THEN
        UPDATE invoices
        SET subtotal = v_subtotal,
            vat_amount = 0,
            total_amount = v_subtotal,
            tax_rate = 0
        WHERE id = inv_id;
    ELSE
        UPDATE invoices
        SET subtotal = v_subtotal,
            vat_amount = v_subtotal * (v_tax_rate / 100.0),
            total_amount = v_subtotal * (1 + (v_tax_rate / 100.0))
        WHERE id = inv_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

