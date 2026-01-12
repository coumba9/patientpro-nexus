-- 1. Fix doctor_applications - require authentication for submissions
DROP POLICY IF EXISTS "Anyone can create applications" ON public.doctor_applications;

CREATE POLICY "Authenticated users can create applications"
ON public.doctor_applications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add explicit denial for anonymous users
CREATE POLICY "Deny anonymous access to doctor_applications"
ON public.doctor_applications
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 2. Tighten invoices access - doctors can only see their OWN appointments' invoices
DROP POLICY IF EXISTS "Users can view their recent invoices" ON public.invoices;

CREATE POLICY "Users can view their invoices"
ON public.invoices
FOR SELECT
USING (
  auth.uid() = patient_id 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (auth.uid() = doctor_id)
);

-- Deny anonymous access to invoices
CREATE POLICY "Deny anonymous access to invoices"
ON public.invoices
FOR SELECT
TO anon
USING (false);

-- 3. Deny anonymous access to sms_logs
CREATE POLICY "Deny anonymous access to sms_logs"
ON public.sms_logs
FOR SELECT
TO anon
USING (false);

-- 4. Apply FORCE RLS to sensitive tables
ALTER TABLE public.doctor_applications FORCE ROW LEVEL SECURITY;
ALTER TABLE public.invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs FORCE ROW LEVEL SECURITY;