-- Fix doctor-documents storage policies - restrict to proper ownership

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Doctors upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Doctors and admins view doctor documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins view all doctor documents" ON storage.objects;

-- Restrict uploads to doctors uploading to their own folder only
CREATE POLICY "Doctors upload to own folder only"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'doctor-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'))
);

-- Restrict reads to document owner or admins
CREATE POLICY "Users view own documents or admins view all"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'doctor-documents' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    public.has_role(auth.uid(), 'admin')
  )
);

-- Allow admins to delete documents if needed
CREATE POLICY "Admins can delete doctor documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'doctor-documents' AND
  public.has_role(auth.uid(), 'admin')
);