-- Fix 1: Simplify profiles table RLS policies to reduce attack surface
-- Remove redundant/complex policies and keep simple ones

-- Drop the complex/redundant policies
DROP POLICY IF EXISTS "Users can view own profile or via function" ON public.profiles;
DROP POLICY IF EXISTS "Verified admins can view all profiles" ON public.profiles;

-- Create a single clean admin policy using the existing has_role function
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Tighten patients table access - reduce 90 day window to 14 days
-- and require only active appointments (not completed)

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Doctors can view active patients data" ON public.patients;

-- Create stricter policy: doctors can only view patients with active appointments
-- within 14 days, OR completed appointments within 7 days for follow-up documentation
CREATE POLICY "Doctors can view patients with active appointments"
ON public.patients
FOR SELECT
USING (
  -- Users can always view their own patient record
  (id = auth.uid())
  OR 
  -- Admins have full access
  public.has_role(auth.uid(), 'admin'::app_role)
  OR 
  -- Doctors can view patient data ONLY if:
  (EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.patient_id = patients.id
    AND a.doctor_id = auth.uid()
    AND (
      -- Active/upcoming appointments (pending or confirmed)
      (a.status IN ('pending', 'confirmed') AND a.date >= CURRENT_DATE - INTERVAL '14 days')
      OR
      -- Recently completed appointments (for documentation only - 7 day window)
      (a.status = 'completed' AND a.date >= CURRENT_DATE - INTERVAL '7 days')
    )
  ))
);