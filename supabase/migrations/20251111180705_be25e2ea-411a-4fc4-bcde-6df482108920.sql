-- Remove the conflicting policy that blocks all access to profiles
DROP POLICY IF EXISTS "Require authentication for profiles" ON public.profiles;

-- Remove the conflicting policy on patients table as well
DROP POLICY IF EXISTS "Require authentication for patients" ON public.patients;

-- Note: The existing policies "Users can view own profile only" and 
-- "Verified admins can view all profiles" already provide proper authentication
-- and authorization without blocking legitimate access