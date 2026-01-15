-- 1. Fix patients table: Reduce access window to 48h after completion and only during confirmed appointments
DROP POLICY IF EXISTS "Doctors can view patients with confirmed or completed appointments" ON public.patients;

CREATE POLICY "Doctors can view patients during active treatment only"
ON public.patients
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND public.has_role(auth.uid(), 'doctor')
  AND EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.doctor_id = auth.uid()
    AND a.patient_id = patients.id
    AND (
      -- For confirmed appointments: only on the appointment day
      (a.status = 'confirmed' AND a.date = CURRENT_DATE)
      OR
      -- For completed appointments: only within 48 hours after completion for follow-up notes
      (a.status = 'completed' AND a.date >= CURRENT_DATE - INTERVAL '2 days' AND a.date <= CURRENT_DATE)
    )
  )
);

-- 2. Fix doctor_applications table: Ensure only admins can view applications
DROP POLICY IF EXISTS "Admins can view all applications" ON public.doctor_applications;
DROP POLICY IF EXISTS "Authenticated users can create applications" ON public.doctor_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.doctor_applications;

-- Only admins can view all applications
CREATE POLICY "Only admins can view doctor applications"
ON public.doctor_applications
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND public.has_role(auth.uid(), 'admin')
);

-- Users can only insert their own applications (not view others)
CREATE POLICY "Users can submit their own application"
ON public.doctor_applications
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Only admins can update applications (for approval/rejection)
CREATE POLICY "Only admins can update applications"
ON public.doctor_applications
FOR UPDATE
USING (
  auth.uid() IS NOT NULL
  AND public.has_role(auth.uid(), 'admin')
);