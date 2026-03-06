-- Migration: add_feedback_system
-- Description: Adds a has_submitted_feedback boolean to profiles and creates the feedback table

-- Add column to profiles
ALTER TABLE IF EXISTS "public"."profiles" 
ADD COLUMN IF NOT EXISTS "has_submitted_feedback" boolean DEFAULT false;

-- Create feedback table
CREATE TABLE IF NOT EXISTS "public"."feedback" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    "user_name" text,
    "user_email" text,
    "message" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now()
);

-- Primary Key
ALTER TABLE "public"."feedback" ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("id");

-- Enable Row Level Security
ALTER TABLE "public"."feedback" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert feedback
CREATE POLICY "Users can insert their own feedback" ON "public"."feedback"
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Useful Index
CREATE INDEX IF NOT EXISTS "idx_feedback_user_id" ON "public"."feedback" USING btree ("user_id");
