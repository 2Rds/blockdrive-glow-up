-- Fix security issue: Deny public read access to waitlist table
-- This prevents competitors from harvesting signup data

CREATE POLICY "Deny public read access to waitlist"
ON public.waitlist
FOR SELECT
USING (false);