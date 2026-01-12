-- Fix notifications table INSERT policy - restrict to own notifications or via triggers/functions
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;

-- Create proper restrictive policies
-- Users can only create notifications for themselves (for self-notifications)
CREATE POLICY "Users can create notifications for themselves"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also add explicit denial for anonymous users on notifications
CREATE POLICY "Deny anonymous access to notifications"
ON public.notifications
FOR SELECT
TO anon
USING (false);

-- Further restrict doctors' access to patients - only within 48 hours of appointment
DROP POLICY IF EXISTS "Doctors can view patients with active appointments" ON public.patients;

CREATE POLICY "Doctors can view patients with imminent appointments"
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
      AND a.date <= CURRENT_DATE + INTERVAL '2 days'
  ))
);