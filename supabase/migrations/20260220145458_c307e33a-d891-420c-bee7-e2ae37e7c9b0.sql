
-- Fix: Only patients can create appointments (prevents doctors from creating fake appointments to access patient data)
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;

CREATE POLICY "Only patients can create appointments"
ON public.appointments
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND patient_id = auth.uid()
);
