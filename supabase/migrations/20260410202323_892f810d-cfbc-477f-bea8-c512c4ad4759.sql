
-- 1. Fix user_roles privilege escalation: add explicit INSERT policy for admins only
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2. Fix signatures bucket: make it private
UPDATE storage.buckets SET public = false WHERE id = 'signatures';

-- Drop existing overly permissive storage policies for signatures
DROP POLICY IF EXISTS "Anyone can view signatures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view signatures" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Doctors can upload signatures" ON storage.objects;
DROP POLICY IF EXISTS "Doctors can update signatures" ON storage.objects;

-- Create scoped storage policies for signatures bucket
CREATE POLICY "Doctors can upload own signatures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'signatures'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Doctors can update own signatures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'signatures'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view signatures they need"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'signatures'
  AND (
    -- Doctor viewing own signature
    auth.uid()::text = (storage.foldername(name))[1]
    -- Admin access
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    -- Patient viewing their doctor's signature (via documents relationship)
    OR EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.patient_id = auth.uid()
      AND d.doctor_id::text = (storage.foldername(name))[1]
      AND d.is_signed = true
    )
  )
);

-- 3. Fix reminders: add SELECT policy for patients
DROP POLICY IF EXISTS "Patients can view own reminders" ON public.reminders;
CREATE POLICY "Patients can view own reminders"
ON public.reminders
FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);
