-- Add B2B lead qualification columns to waitlist table
ALTER TABLE public.waitlist
ADD COLUMN name TEXT,
ADD COLUMN company TEXT,
ADD COLUMN company_size TEXT,
ADD COLUMN use_case TEXT;