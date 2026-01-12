-- Apply FORCE RLS to patients table for extra security
ALTER TABLE public.patients FORCE ROW LEVEL SECURITY;