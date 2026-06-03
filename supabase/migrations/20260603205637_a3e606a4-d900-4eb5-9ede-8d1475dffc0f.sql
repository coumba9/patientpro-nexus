-- 1) Remove the overly broad SELECT policy on messages that exposes all messages
DROP POLICY IF EXISTS "Authenticated can receive realtime" ON public.messages;

-- 2) Add a RESTRICTIVE INSERT policy on user_roles so only admins can ever insert roles
DROP POLICY IF EXISTS "Restrict role insertion to admins" ON public.user_roles;
CREATE POLICY "Restrict role insertion to admins"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));