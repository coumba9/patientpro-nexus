-- 1. Remove overly broad SELECT policy on messages that exposes all messages to any authenticated user.
DROP POLICY IF EXISTS "Authenticated can receive realtime" ON public.messages;

-- 2. Allow authenticated users to view verified doctors' unavailability periods (needed for booking).
DROP POLICY IF EXISTS "Authenticated users can view verified doctor unavailability" ON public.doctor_unavailability_periods;
CREATE POLICY "Authenticated users can view verified doctor unavailability"
ON public.doctor_unavailability_periods
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.id = doctor_unavailability_periods.doctor_id
      AND d.is_verified = true
  )
);

-- 3. Allow patients to create their own queue entries (scoped to their own patient_id).
DROP POLICY IF EXISTS "Patients can create their own queue entries" ON public.queue_entries;
CREATE POLICY "Patients can create their own queue entries"
ON public.queue_entries
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id);