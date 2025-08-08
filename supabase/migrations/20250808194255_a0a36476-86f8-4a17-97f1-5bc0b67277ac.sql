-- Corriger les avertissements de sécurité RLS

-- 1. Vérifier quelles tables ont RLS activé mais sans politiques
-- et ajouter les politiques manquantes pour les nouvelles tables

-- Pour les politiques des autres tables qui peuvent avoir été supprimées
-- lors du DROP CASCADE, les recréer :

-- Politiques pour profiles
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour doctors
CREATE POLICY IF NOT EXISTS "Doctors can manage own information" ON public.doctors
FOR ALL TO authenticated
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Admins can manage all doctors" ON public.doctors
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour patients
CREATE POLICY IF NOT EXISTS "Users can view their own patient profile" ON public.patients
FOR SELECT TO authenticated
USING ((id = auth.uid()) OR (EXISTS ( SELECT 1 FROM doctors WHERE (doctors.id = auth.uid()))));

CREATE POLICY IF NOT EXISTS "Users can insert their own patient record" ON public.patients
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update their own patient record" ON public.patients
FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Admins can view all patients" ON public.patients
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour appointments
CREATE POLICY IF NOT EXISTS "Users can view appointments they're involved in" ON public.appointments
FOR SELECT TO authenticated
USING ((patient_id = auth.uid()) OR (doctor_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "Users can create appointments" ON public.appointments
FOR INSERT TO authenticated
WITH CHECK ((patient_id = auth.uid()) OR (doctor_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "Users can update appointments they're involved in" ON public.appointments
FOR UPDATE TO authenticated
USING ((patient_id = auth.uid()) OR (doctor_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "Admins can view all appointments" ON public.appointments
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));