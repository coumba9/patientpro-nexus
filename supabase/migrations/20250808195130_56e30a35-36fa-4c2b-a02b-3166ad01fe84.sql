-- Ajouter les politiques manquantes pour admin_metrics et reminders

-- Politiques pour admin_metrics
CREATE POLICY "Admins can manage metrics" ON public.admin_metrics
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour reminders
CREATE POLICY "Admins can manage reminders" ON public.reminders
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour moderation_reports (au cas où)
DROP POLICY IF EXISTS "Admins can manage all reports" ON public.moderation_reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.moderation_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.moderation_reports;

CREATE POLICY "Admins can manage all reports" ON public.moderation_reports
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create reports" ON public.moderation_reports
FOR INSERT TO authenticated
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view their own reports" ON public.moderation_reports
FOR SELECT TO authenticated
USING (reporter_id = auth.uid());

-- Politiques pour queue_entries
DROP POLICY IF EXISTS "Admins can manage queue" ON public.queue_entries;
DROP POLICY IF EXISTS "Patients can view their own queue entries" ON public.queue_entries;

CREATE POLICY "Admins can manage queue" ON public.queue_entries
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Patients can view their own queue entries" ON public.queue_entries
FOR SELECT TO authenticated
USING (auth.uid() = patient_id);

-- Politiques pour cancellation_policies
DROP POLICY IF EXISTS "Admins can manage cancellation policies" ON public.cancellation_policies;
DROP POLICY IF EXISTS "Authenticated users can view cancellation policies" ON public.cancellation_policies;

CREATE POLICY "Admins can manage cancellation policies" ON public.cancellation_policies
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view cancellation policies" ON public.cancellation_policies
FOR SELECT TO authenticated
USING (true);

-- Politiques pour specialties  
DROP POLICY IF EXISTS "Admins can manage specialties" ON public.specialties;
DROP POLICY IF EXISTS "Anyone can view specialties" ON public.specialties;

CREATE POLICY "Admins can manage specialties" ON public.specialties
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view specialties" ON public.specialties
FOR SELECT TO authenticated
USING (true);