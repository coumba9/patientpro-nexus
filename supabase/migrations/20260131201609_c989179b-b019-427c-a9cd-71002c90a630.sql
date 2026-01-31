-- Drop existing SELECT policies on profiles
DROP POLICY IF EXISTS "Authenticated users can view own profile or admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

-- Create a proper PERMISSIVE policy that restricts access correctly
-- Users can ONLY view their own profile, admins can view all
CREATE POLICY "Users can view own profile only"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (auth.uid() = id) OR has_role(auth.uid(), 'admin'::app_role)
);

-- Block anonymous access explicitly
CREATE POLICY "Block anonymous profile access"
ON public.profiles
FOR SELECT
TO anon
USING (false);