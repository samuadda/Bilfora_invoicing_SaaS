-- Ensure the invoice_sequences table exists
CREATE TABLE IF NOT EXISTS public.invoice_sequences (
    user_id uuid NOT NULL,
    next_number bigint NOT NULL DEFAULT 1,
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Re-apply constraints safely if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoice_sequences_pkey') THEN
        ALTER TABLE public.invoice_sequences ADD CONSTRAINT invoice_sequences_pkey PRIMARY KEY (user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoice_sequences_user_id_fkey') THEN
        ALTER TABLE public.invoice_sequences ADD CONSTRAINT invoice_sequences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT ALL ON TABLE public.invoice_sequences TO postgres, anon, authenticated, service_role;

-- Policies safely recreated
DO $$
BEGIN
    DROP POLICY IF EXISTS "invoice_sequences_insert_own" ON public.invoice_sequences;
    DROP POLICY IF EXISTS "invoice_sequences_select_own" ON public.invoice_sequences;
    DROP POLICY IF EXISTS "invoice_sequences_update_own" ON public.invoice_sequences;
END $$;

CREATE POLICY "invoice_sequences_insert_own" ON public.invoice_sequences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "invoice_sequences_select_own" ON public.invoice_sequences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "invoice_sequences_update_own" ON public.invoice_sequences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
