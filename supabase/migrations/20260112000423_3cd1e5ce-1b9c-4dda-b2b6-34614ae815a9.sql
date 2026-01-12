-- Tighten profiles SELECT policies to avoid any ambiguity and ensure only owners/admins can read

-- Remove older overlapping policies
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Keep the explicit anon denial policy (created earlier)
-- (Do not recreate if it already exists)

-- Create a single clear SELECT policy for authenticated users:
-- - user can read own profile
-- - admin can read any profile
CREATE POLICY "Authenticated users can view own profile or admins can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR has_role(auth.uid(), 'admin'::app_role)
);

-- Optional hardening: ensure RLS always applies (including table owner)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;