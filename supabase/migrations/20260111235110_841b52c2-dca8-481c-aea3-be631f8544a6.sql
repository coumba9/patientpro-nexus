-- Add explicit policy to deny anonymous access to profiles table
-- This prevents enumeration attacks from unauthenticated users

CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);