-- Corriger les politiques RLS (sans IF NOT EXISTS)

-- D'abord supprimer les politiques existantes puis les recréer
-- Politiques pour profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles; 
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour doctors
DROP POLICY IF EXISTS "Doctors can manage own information" ON public.doctors;
DROP POLICY IF EXISTS "Admins can manage all doctors" ON public.doctors;

CREATE POLICY "Doctors can manage own information" ON public.doctors
FOR ALL TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can manage all doctors" ON public.doctors
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour patients 
DROP POLICY IF EXISTS "Users can view their own patient profile" ON public.patients;
DROP POLICY IF EXISTS "Users can insert their own patient record" ON public.patients;
DROP POLICY IF EXISTS "Users can update their own patient record" ON public.patients;
DROP POLICY IF EXISTS "Admins can view all patients" ON public.patients;

CREATE POLICY "Users can view their own patient profile" ON public.patients
FOR SELECT TO authenticated
USING ((id = auth.uid()) OR (EXISTS ( SELECT 1 FROM doctors WHERE (doctors.id = auth.uid()))));

CREATE POLICY "Users can insert their own patient record" ON public.patients
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own patient record" ON public.patients
FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all patients" ON public.patients
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));