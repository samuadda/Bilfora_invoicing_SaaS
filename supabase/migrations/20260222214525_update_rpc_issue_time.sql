-- Migration: Update create_invoice_with_items RPC to include issue_time
-- Description: Adds the missing p_issue_time parameter to match client code.

CREATE OR REPLACE FUNCTION public.create_invoice_with_items(
  p_client_id uuid,
  p_order_id uuid,
  p_invoice_type text,
  p_document_kind text,
  p_issue_date date,
  p_issue_time text, -- Added parameter
  p_due_date date,
  p_status text,
  p_tax_rate numeric,
  p_notes text,
  p_items jsonb,
  p_payment_info jsonb DEFAULT NULL
)
RETURNS TABLE(id uuid, invoice_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid;
  v_invoice_id uuid;
  v_invoice_number text;
  v_next_seq integer;
  v_prefix text;
  v_item jsonb;
  v_subtotal numeric := 0;
  v_tax_amount numeric := 0;
  v_total_amount numeric := 0;
  v_vat_amount numeric := 0;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Get or Initialize Invoice Sequence
  INSERT INTO invoice_sequences (user_id, next_number)
  VALUES (v_user_id, 1)
  ON CONFLICT (user_id) DO NOTHING;
  
  UPDATE invoice_sequences
  SET next_number = next_number + 1,
      updated_at = now()
  WHERE user_id = v_user_id
  RETURNING next_number - 1 INTO v_next_seq;

  -- 2. Get Prefix
  SELECT numbering_prefix INTO v_prefix
  FROM invoice_settings
  WHERE user_id = v_user_id;

  IF v_prefix IS NULL THEN
    v_prefix := 'INV-';
  END IF;

  v_invoice_number := v_prefix || LPAD(v_next_seq::text, 5, '0');

  -- 3. Calculate Totals
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_subtotal := v_subtotal + ((v_item->>'quantity')::numeric * (v_item->>'unit_price')::numeric);
  END LOOP;

  v_tax_amount := v_subtotal * (p_tax_rate / 100);
  v_vat_amount := v_tax_amount; 
  v_total_amount := v_subtotal + v_tax_amount;

  -- 4. Insert Invoice with CASTS
  INSERT INTO invoices (
    user_id,
    client_id,
    order_id,
    invoice_number,
    invoice_type,
    document_kind,
    issue_date,
    issue_time, -- Added column
    due_date,
    status,
    tax_rate,
    notes,
    subtotal,
    tax_amount,
    vat_amount,
    total_amount,
    payment_info,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_client_id,
    p_order_id,
    v_invoice_number,
    p_invoice_type::invoice_type_v3, 
    p_document_kind::document_kind, 
    p_issue_date,
    p_issue_time, -- Added value
    p_due_date,
    p_status,
    p_tax_rate,
    p_notes,
    v_subtotal,
    v_tax_amount,
    v_vat_amount,
    v_total_amount,
    p_payment_info,
    now(),
    now()
  )
  RETURNING invoices.id INTO v_invoice_id;

  -- 5. Insert Items
  IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
    INSERT INTO invoice_items (
      invoice_id,
      description,
      quantity,
      unit_price,
      total
    )
    SELECT
      v_invoice_id,
      item->>'description',
      (item->>'quantity')::numeric,
      (item->>'unit_price')::numeric,
      (item->>'quantity')::numeric * (item->>'unit_price')::numeric
    FROM jsonb_array_elements(p_items) AS item;
  END IF;

  RETURN QUERY SELECT v_invoice_id, v_invoice_number;
END;
$function$;
