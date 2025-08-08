-- Compléter toutes les politiques RLS manquantes

-- Politiques pour appointments
DROP POLICY IF EXISTS "Users can view appointments they're involved in" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update appointments they're involved in" ON public.appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON public.appointments;

CREATE POLICY "Users can view appointments they're involved in" ON public.appointments
FOR SELECT TO authenticated
USING ((patient_id = auth.uid()) OR (doctor_id = auth.uid()));

CREATE POLICY "Users can create appointments" ON public.appointments
FOR INSERT TO authenticated
WITH CHECK ((patient_id = auth.uid()) OR (doctor_id = auth.uid()));

CREATE POLICY "Users can update appointments they're involved in" ON public.appointments
FOR UPDATE TO authenticated
USING ((patient_id = auth.uid()) OR (doctor_id = auth.uid()));

CREATE POLICY "Admins can view all appointments" ON public.appointments
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour notes
DROP POLICY IF EXISTS "Users can view notes they're involved in" ON public.notes;
DROP POLICY IF EXISTS "Doctors can create and update notes" ON public.notes;
DROP POLICY IF EXISTS "Admins can view all notes" ON public.notes;

CREATE POLICY "Users can view notes they're involved in" ON public.notes
FOR SELECT TO authenticated
USING ((patient_id = auth.uid()) OR (doctor_id = auth.uid()));

CREATE POLICY "Doctors can create and update notes" ON public.notes
FOR ALL TO authenticated
USING (doctor_id = auth.uid());

CREATE POLICY "Admins can view all notes" ON public.notes
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour medical_records
DROP POLICY IF EXISTS "Users can view medical records they're involved in" ON public.medical_records;
DROP POLICY IF EXISTS "Doctors can create medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Admins can view all medical records" ON public.medical_records;

CREATE POLICY "Users can view medical records they're involved in" ON public.medical_records
FOR SELECT TO authenticated
USING ((patient_id = auth.uid()) OR (doctor_id = auth.uid()));

CREATE POLICY "Doctors can create medical records" ON public.medical_records
FOR INSERT TO authenticated
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Admins can view all medical records" ON public.medical_records
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view all notifications" ON public.notifications
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));