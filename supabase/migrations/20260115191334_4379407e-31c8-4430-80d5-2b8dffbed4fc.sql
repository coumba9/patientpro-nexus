-- Drop the existing overly permissive policy for doctors
DROP POLICY IF EXISTS "Doctors can view patients with imminent appointments" ON public.patients;

-- Create a more restrictive policy: doctors can only view patients with CONFIRMED or COMPLETED appointments
CREATE POLICY "Doctors can view patients with confirmed or completed appointments"
ON public.patients
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND public.has_role(auth.uid(), 'doctor')
  AND EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.doctor_id = auth.uid()
    AND a.patient_id = patients.id
    AND a.status IN ('confirmed', 'completed')
    AND (
      -- For confirmed appointments: only within 24 hours before and during
      (a.status = 'confirmed' AND a.date >= CURRENT_DATE AND a.date <= CURRENT_DATE + INTERVAL '1 day')
      OR
      -- For completed appointments: within 7 days after completion
      (a.status = 'completed' AND a.date >= CURRENT_DATE - INTERVAL '7 days')
    )
  )
);