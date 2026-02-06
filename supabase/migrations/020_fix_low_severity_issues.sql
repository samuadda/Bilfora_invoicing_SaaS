-- Migration: Fix LOW Severity Issues
-- Description: Addresses LOW severity issues from database audit

-- ============================================================================
-- LOW FIX #1: Rename misnamed constraint
-- ============================================================================

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS check_due_date_future;
ALTER TABLE public.orders 
    ADD CONSTRAINT check_updated_after_created CHECK (created_at <= updated_at);


-- ============================================================================
-- LOW FIX #2: Update handle_new_user to use clearly fake phone placeholder
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), '+000000000000'),
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
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RAISE;
END;
$function$;

COMMENT ON FUNCTION public.handle_new_user() IS 
    'Auto-populates profile when new user is created. Uses placeholder values if metadata is missing.';
