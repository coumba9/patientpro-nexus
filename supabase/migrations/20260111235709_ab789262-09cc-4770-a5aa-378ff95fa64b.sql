-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Doctors can view patients with active appointments" ON public.patients;

-- Create a more restrictive policy that only allows doctors to view patients
-- with ACTIVE appointments (pending or confirmed) - no extended time windows
CREATE POLICY "Doctors can view patients with active appointments"
ON public.patients
FOR SELECT
USING (
  (id = auth.uid()) 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR (EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.patient_id = patients.id
      AND a.doctor_id = auth.uid()
      AND a.status IN ('pending', 'confirmed')
      AND a.date >= CURRENT_DATE
  ))
);

-- Also add explicit denial for anonymous users on patients table
CREATE POLICY "Deny anonymous access to patients"
ON public.patients
FOR SELECT
TO anon
USING (false);