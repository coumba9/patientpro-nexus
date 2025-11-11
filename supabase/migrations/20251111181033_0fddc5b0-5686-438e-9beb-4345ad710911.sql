-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own patient profile" ON public.patients;
DROP POLICY IF EXISTS "Doctors can view their patients' data" ON public.patients;

-- Create a more restrictive policy for patients to view their own data
CREATE POLICY "Users can view their own patient profile"
ON public.patients
FOR SELECT
USING (id = auth.uid());

-- Create a separate policy for doctors to view only their patients' data
-- Doctors can only access patients they have appointments with or medical records for
CREATE POLICY "Doctors can view their patients' data"
ON public.patients
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM appointments 
    WHERE appointments.patient_id = patients.id 
    AND appointments.doctor_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM medical_records 
    WHERE medical_records.patient_id = patients.id 
    AND medical_records.doctor_id = auth.uid()
  )
);