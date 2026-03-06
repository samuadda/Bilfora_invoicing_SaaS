-- Drop the NOT NULL constraint on the message column since it's optional in the new multi-step wizard
ALTER TABLE public.feedback ALTER COLUMN message DROP NOT NULL;
