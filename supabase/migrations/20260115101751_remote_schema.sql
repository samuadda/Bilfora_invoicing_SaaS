drop extension if exists "pg_net";

create type "public"."invoice_type_v2" as enum ('standard', 'simplified', 'regular');

create type "public"."invoice_type_v3" as enum ('standard_tax', 'simplified_tax', 'non_tax');

create sequence "public"."invoice_number_seq";

create sequence "public"."order_number_seq";

alter table "public"."invoices" drop constraint "invoices_invoice_number_key";

alter table "public"."orders" drop constraint "orders_order_number_key";

drop index if exists "public"."invoices_invoice_number_key";

drop index if exists "public"."orders_order_number_key";


  create table "public"."invoice_sequences" (
    "user_id" uuid not null,
    "next_number" bigint not null default 1,
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."invoice_sequences" enable row level security;

alter table "public"."invoices" drop column "type";

alter table "public"."invoices" add column "invoice_type" public.invoice_type_v3 not null default 'standard_tax'::public.invoice_type_v3;

alter table "public"."products" drop column "sku";

CREATE UNIQUE INDEX invoice_sequences_pkey ON public.invoice_sequences USING btree (user_id);

CREATE UNIQUE INDEX invoices_user_invoice_number_uq ON public.invoices USING btree (user_id, invoice_number);

CREATE UNIQUE INDEX orders_user_order_number_key ON public.orders USING btree (user_id, order_number);

alter table "public"."invoice_sequences" add constraint "invoice_sequences_pkey" PRIMARY KEY using index "invoice_sequences_pkey";

alter table "public"."invoice_sequences" add constraint "invoice_sequences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."invoice_sequences" validate constraint "invoice_sequences_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
declare
  yr text := to_char(now(), 'YYYY');
  seq int;
begin
  seq := nextval('public.invoice_number_seq');
  return 'INV-' || yr || '-' || lpad(seq::text, 6, '0');
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_invoice_with_items(p_client_id uuid, p_order_id uuid, p_invoice_type text, p_document_kind text, p_issue_date date, p_due_date date, p_status text, p_tax_rate numeric, p_notes text, p_items jsonb)
 RETURNS TABLE(id uuid, invoice_number text)
 LANGUAGE plpgsql
 SECURITY DEFINER
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
    due_date,
    status,
    tax_rate,
    notes,
    subtotal,
    tax_amount,
    vat_amount,
    total_amount,
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
    p_due_date,
    p_status,
    p_tax_rate,
    p_notes,
    v_subtotal,
    v_tax_amount,
    v_vat_amount,
    v_total_amount,
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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        phone,
        dob,
        gender,
        account_type,
        company_name,
        tax_number,
        address,
        city
    ) VALUES (
        NEW.id,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'User'),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), '+966500000000'),
        COALESCE((NEW.raw_user_meta_data->>'dob')::DATE, '1990-01-01'::DATE),
        NEW.raw_user_meta_data->>'gender',
        COALESCE(NEW.raw_user_meta_data->>'account_type', 'individual'),
        NEW.raw_user_meta_data->>'company_name',
        NEW.raw_user_meta_data->>'tax_number',
        NEW.raw_user_meta_data->>'address',
        NEW.raw_user_meta_data->>'city'
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and re-raise it
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RAISE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.recalc_invoice_totals(inv_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_subtotal numeric(12,2) := 0;
    v_tax_rate numeric := 0;
    v_invoice_type text;
BEGIN
    SELECT COALESCE(SUM(ii.quantity * ii.unit_price), 0)
    INTO v_subtotal
    FROM invoice_items ii
    WHERE ii.invoice_id = inv_id;

    SELECT COALESCE(tax_rate, 0), invoice_type::text INTO v_tax_rate, v_invoice_type 
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
$function$
;

CREATE OR REPLACE FUNCTION public.set_invoice_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
  seq bigint;
begin
  if new.invoice_number is null or new.invoice_number = '' then
    seq := nextval('public.invoice_number_seq');
    new.invoice_number := 'INV-' || to_char(now(), 'YYYY') || '-' || lpad(seq::text, 6, '0');
  end if;

  return new;
end;
$function$
;

grant delete on table "public"."invoice_sequences" to "anon";

grant insert on table "public"."invoice_sequences" to "anon";

grant references on table "public"."invoice_sequences" to "anon";

grant select on table "public"."invoice_sequences" to "anon";

grant trigger on table "public"."invoice_sequences" to "anon";

grant truncate on table "public"."invoice_sequences" to "anon";

grant update on table "public"."invoice_sequences" to "anon";

grant delete on table "public"."invoice_sequences" to "authenticated";

grant insert on table "public"."invoice_sequences" to "authenticated";

grant references on table "public"."invoice_sequences" to "authenticated";

grant select on table "public"."invoice_sequences" to "authenticated";

grant trigger on table "public"."invoice_sequences" to "authenticated";

grant truncate on table "public"."invoice_sequences" to "authenticated";

grant update on table "public"."invoice_sequences" to "authenticated";

grant delete on table "public"."invoice_sequences" to "service_role";

grant insert on table "public"."invoice_sequences" to "service_role";

grant references on table "public"."invoice_sequences" to "service_role";

grant select on table "public"."invoice_sequences" to "service_role";

grant trigger on table "public"."invoice_sequences" to "service_role";

grant truncate on table "public"."invoice_sequences" to "service_role";

grant update on table "public"."invoice_sequences" to "service_role";


  create policy "invoice_sequences_insert_own"
  on "public"."invoice_sequences"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));



  create policy "invoice_sequences_select_own"
  on "public"."invoice_sequences"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



  create policy "invoice_sequences_update_own"
  on "public"."invoice_sequences"
  as permissive
  for update
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


CREATE TRIGGER trg_set_invoice_number BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_invoice_number();

drop policy "Users can delete their own avatars" on "storage"."objects";


  create policy "Authenticated uploads"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'public'::text));



  create policy "Public read access"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'public'::text));



