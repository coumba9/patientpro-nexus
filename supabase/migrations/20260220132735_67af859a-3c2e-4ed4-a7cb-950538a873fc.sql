
-- Fix: Restrict doctor access to patients to only confirmed appointments on current date
DROP POLICY IF EXISTS "Doctors can view patients during active treatment only" ON public.patients;

CREATE POLICY "Doctors can view patients during active appointment only"
ON public.patients
FOR SELECT
USING (
  (auth.uid() IS NOT NULL)
  AND has_role(auth.uid(), 'doctor'::app_role)
  AND EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.doctor_id = auth.uid()
      AND a.patient_id = patients.id
      AND a.status IN ('confirmed', 'completed')
      AND a.date = CURRENT_DATE
  )
);
