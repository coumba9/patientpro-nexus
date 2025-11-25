-- Allow admins to fully manage patient records (including status updates)
CREATE POLICY "Admins can manage all patients"
ON public.patients
FOR ALL
USING (has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::public.app_role));

-- Allow users to view profiles of people they have a direct medical or messaging relationship with
CREATE POLICY "Users can view related profiles"
ON public.profiles
FOR SELECT
USING (
  -- Own profile
  auth.uid() = id
  OR
  -- Already-verified admins (kept for clarity, existing policy also handles this)
  is_current_user_admin() = true
  OR
  -- Doctor and patient linked by an appointment (either direction)
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE
      (a.patient_id = auth.uid() AND a.doctor_id = profiles.id)
      OR
      (a.doctor_id = auth.uid() AND a.patient_id = profiles.id)
  )
  OR
  -- Any two users who have exchanged messages (for messaging names)
  EXISTS (
    SELECT 1 FROM public.messages m
    WHERE
      (m.sender_id = auth.uid() AND m.receiver_id = profiles.id)
      OR
      (m.receiver_id = auth.uid() AND m.sender_id = profiles.id)
  )
);