
-- 1) user_roles: convert "prevent self" policies to RESTRICTIVE so they actually block
DROP POLICY IF EXISTS "Prevent self role deletion" ON public.user_roles;
DROP POLICY IF EXISTS "Prevent self role modification" ON public.user_roles;

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role) AND user_id <> auth.uid());

CREATE POLICY "Only admins can update roles"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role) AND user_id <> auth.uid());

-- 2) medical_records: require an actual doctor-patient appointment, not just <2y old
DROP POLICY IF EXISTS "Users can view recent medical records" ON public.medical_records;

CREATE POLICY "Users can view their medical records"
ON public.medical_records
FOR SELECT
TO authenticated
USING (
  patient_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR (
    doctor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.patient_id = medical_records.patient_id
        AND a.doctor_id = auth.uid()
        AND a.status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'completed'::text])
        AND a.date >= (CURRENT_DATE - INTERVAL '90 days')
    )
  )
);

-- 3) signatures bucket: drop duplicate, path-unconstrained policies; add DELETE
DROP POLICY IF EXISTS "Doctors can upload their signatures" ON storage.objects;
DROP POLICY IF EXISTS "Doctors can update their signatures" ON storage.objects;

CREATE POLICY "Doctors can delete own signatures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'signatures'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 4) doctor_availability_slots: allow authenticated users to view verified doctors' slots
CREATE POLICY "Authenticated users can view verified doctor slots"
ON public.doctor_availability_slots
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.id = doctor_availability_slots.doctor_id
      AND d.is_verified = true
  )
);

-- 5) Remove sensitive doctor_applications from realtime publication
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'doctor_applications'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.doctor_applications';
  END IF;
END $$;

-- 6) Realtime authorization: require authentication to subscribe / receive
DROP POLICY IF EXISTS "Authenticated can receive realtime" ON realtime.messages;
CREATE POLICY "Authenticated can receive realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);
