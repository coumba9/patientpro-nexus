REVOKE ALL ON public.doctors FROM anon;

CREATE POLICY "Deny anonymous access to doctors"
ON public.doctors
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);