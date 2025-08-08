
-- Supprimer toutes les tables et types existants pour repartir à zéro
DROP TABLE IF EXISTS public.reminders CASCADE;
DROP TABLE IF EXISTS public.admin_metrics CASCADE;
DROP TABLE IF EXISTS public.cancellation_policies CASCADE;
DROP TABLE IF EXISTS public.queue_entries CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.moderation_reports CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.medical_records CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.specialties CASCADE;

-- Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.increment_specialty_doctor_count() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.can_cancel_appointment(uuid, uuid, text) CASCADE;

-- Supprimer les types existants
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Créer le type app_role
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'patient');

-- Table profiles (doit être créée en premier)
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name text,
    last_name text,
    email text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Table user_roles
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Table specialties
CREATE TABLE public.specialties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    status text DEFAULT 'active' NOT NULL,
    total_doctors integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

-- Insérer les spécialités de base
INSERT INTO public.specialties (name, description) VALUES
    ('Médecine générale', 'Consultation générale et soins de base'),
    ('Cardiologie', 'Spécialiste du cœur et des vaisseaux sanguins'),
    ('Dermatologie', 'Spécialiste de la peau'),
    ('Pédiatrie', 'Médecine des enfants');

-- Table doctors
CREATE TABLE public.doctors (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    specialty_id uuid REFERENCES public.specialties(id),
    license_number text NOT NULL,
    years_of_experience integer DEFAULT 0,
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Table patients
CREATE TABLE public.patients (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    medical_record_id uuid,
    birth_date date,
    gender text,
    blood_type text,
    allergies text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Table appointments
CREATE TABLE public.appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    date date NOT NULL,
    time time NOT NULL,
    status text DEFAULT 'pending' NOT NULL,
    type text DEFAULT 'consultation' NOT NULL,
    mode text DEFAULT 'in_person' NOT NULL,
    location text,
    notes text,
    cancelled_at timestamp with time zone,
    cancelled_by uuid,
    cancellation_reason text,
    cancellation_type text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Table medical_records
CREATE TABLE public.medical_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL,
    doctor_id uuid NOT NULL,
    date date NOT NULL,
    diagnosis text NOT NULL,
    prescription text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Table notes
CREATE TABLE public.notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL,
    doctor_id uuid NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Table notifications
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    appointment_id uuid,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    priority text DEFAULT 'medium' NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Table moderation_reports
CREATE TABLE public.moderation_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id uuid,
    reported_id uuid,
    reason text NOT NULL,
    details text,
    status text DEFAULT 'pending' NOT NULL,
    resolved_by uuid,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;

-- Table queue_entries
CREATE TABLE public.queue_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL,
    requested_doctor_id uuid,
    specialty_id uuid,
    preferred_dates date[],
    notes text,
    status text DEFAULT 'waiting' NOT NULL,
    urgency text DEFAULT 'normal' NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;

-- Table cancellation_policies
CREATE TABLE public.cancellation_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_type text NOT NULL,
    minimum_hours_before integer DEFAULT 24 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.cancellation_policies ENABLE ROW LEVEL SECURITY;

-- Table admin_metrics
CREATE TABLE public.admin_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL,
    value integer NOT NULL,
    period text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.admin_metrics ENABLE ROW LEVEL SECURITY;

-- Table reminders
CREATE TABLE public.reminders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    reminder_type text NOT NULL,
    method text NOT NULL,
    scheduled_for timestamp with time zone NOT NULL,
    status text DEFAULT 'pending' NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Créer les fonctions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT public.has_role(user_id, 'admin');
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insérer dans profiles
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email;
  
  -- Insérer le rôle dans user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')::app_role
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Si l'utilisateur est un médecin, l'ajouter à la table doctors
  IF COALESCE(NEW.raw_user_meta_data->>'role', '') = 'doctor' THEN
    INSERT INTO public.doctors (
      id, 
      specialty_id, 
      license_number, 
      years_of_experience
    )
    VALUES (
      NEW.id,
      CASE 
        WHEN NEW.raw_user_meta_data->>'speciality' IS NOT NULL 
        THEN (SELECT id FROM public.specialties WHERE name = NEW.raw_user_meta_data->>'speciality' LIMIT 1)
        ELSE NULL
      END,
      COALESCE(NEW.raw_user_meta_data->>'licenseNumber', ''),
      COALESCE((NEW.raw_user_meta_data->>'yearsOfExperience')::INTEGER, 0)
    )
    ON CONFLICT (id) DO UPDATE SET
      specialty_id = EXCLUDED.specialty_id,
      license_number = EXCLUDED.license_number,
      years_of_experience = EXCLUDED.years_of_experience;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Créer les triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Créer toutes les politiques RLS

-- Politiques pour profiles
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour specialties
CREATE POLICY "Anyone can view specialties" ON public.specialties
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage specialties" ON public.specialties
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour doctors
CREATE POLICY "Doctors can manage own information" ON public.doctors
FOR ALL TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can manage all doctors" ON public.doctors
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour patients
CREATE POLICY "Users can view their own patient profile" ON public.patients
FOR SELECT TO authenticated
USING ((id = auth.uid()) OR (EXISTS (SELECT 1 FROM doctors WHERE doctors.id = auth.uid())));

CREATE POLICY "Users can insert their own patient record" ON public.patients
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own patient record" ON public.patients
FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all patients" ON public.patients
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour appointments
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

-- Politiques pour medical_records
CREATE POLICY "Users can view medical records they're involved in" ON public.medical_records
FOR SELECT TO authenticated
USING ((patient_id = auth.uid()) OR (doctor_id = auth.uid()));

CREATE POLICY "Doctors can create medical records" ON public.medical_records
FOR INSERT TO authenticated
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Admins can view all medical records" ON public.medical_records
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour notes
CREATE POLICY "Users can view notes they're involved in" ON public.notes
FOR SELECT TO authenticated
USING ((patient_id = auth.uid()) OR (doctor_id = auth.uid()));

CREATE POLICY "Doctors can create and update notes" ON public.notes
FOR ALL TO authenticated
USING (doctor_id = auth.uid());

CREATE POLICY "Admins can view all notes" ON public.notes
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour notifications
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

-- Politiques pour moderation_reports
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
CREATE POLICY "Admins can manage queue" ON public.queue_entries
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Patients can view their own queue entries" ON public.queue_entries
FOR SELECT TO authenticated
USING (auth.uid() = patient_id);

-- Politiques pour cancellation_policies
CREATE POLICY "Admins can manage cancellation policies" ON public.cancellation_policies
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view cancellation policies" ON public.cancellation_policies
FOR SELECT TO authenticated
USING (true);

-- Politiques pour admin_metrics
CREATE POLICY "Admins can manage metrics" ON public.admin_metrics
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Politiques pour reminders
CREATE POLICY "Admins can manage reminders" ON public.reminders
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
