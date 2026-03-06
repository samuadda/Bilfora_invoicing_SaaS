-- Add new columns for the multi-step feedback wizard
ALTER TABLE public.feedback 
ADD COLUMN ui_rating INTEGER CHECK (ui_rating >= 1 AND ui_rating <= 5),
ADD COLUMN liked_most TEXT,
ADD COLUMN hated_most TEXT,
ADD COLUMN missing_features TEXT;
