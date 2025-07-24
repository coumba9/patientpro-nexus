-- First, create a proper user_roles table to replace the insecure role storage
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'patient');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles safely
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create function to get current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Update the existing is_admin function to be more secure
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.has_role(user_id, 'admin');
$$;

-- Drop all policies that depend on the profiles.role column
DROP POLICY IF EXISTS "Admins can manage all doctors" ON public.doctors;
DROP POLICY IF EXISTS "Admins can view all doctors" ON public.doctors;
DROP POLICY IF EXISTS "Admins can manage queue" ON public.queue_entries;
DROP POLICY IF EXISTS "Admins can manage reminders" ON public.reminders;
DROP POLICY IF EXISTS "Admins can manage specialties" ON public.specialties;
DROP POLICY IF EXISTS "Admins can modify specialties" ON public.specialties;
DROP POLICY IF EXISTS "Admins can view all specialties" ON public.specialties;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;

-- Remove the role column from profiles table
ALTER TABLE public.profiles DROP COLUMN role;

-- Recreate all the policies using the secure has_role function
CREATE POLICY "Admins can manage all doctors" ON public.doctors
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage queue" ON public.queue_entries
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage reminders" ON public.reminders
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage specialties" ON public.specialties
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all notifications" ON public.notifications
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create policies for user_roles table
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Update the handle_new_user function to be more secure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  
  -- Insert role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')::app_role
  );
  
  -- If user is a doctor, add to doctors table
  IF COALESCE(NEW.raw_user_meta_data->>'role', '') = 'doctor' THEN
    INSERT INTO public.doctors (
      id, 
      specialty_id, 
      license_number, 
      years_of_experience
    )
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'speciality')::UUID,
      COALESCE(NEW.raw_user_meta_data->>'licenseNumber', ''),
      COALESCE((NEW.raw_user_meta_data->>'yearsOfExperience')::INTEGER, 0)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update all remaining policies to use secure functions
DROP POLICY IF EXISTS "Admins can manage all reports" ON public.moderation_reports;
CREATE POLICY "Admins can manage all reports" ON public.moderation_reports
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all patients" ON public.patients;
CREATE POLICY "Admins can view all patients" ON public.patients
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all appointments" ON public.appointments;
CREATE POLICY "Admins can view all appointments" ON public.appointments
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all medical records" ON public.medical_records;
CREATE POLICY "Admins can view all medical records" ON public.medical_records
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all notes" ON public.notes;
CREATE POLICY "Admins can view all notes" ON public.notes
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage metrics" ON public.admin_metrics;
CREATE POLICY "Admins can manage metrics" ON public.admin_metrics
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage cancellation policies" ON public.cancellation_policies;
CREATE POLICY "Admins can manage cancellation policies" ON public.cancellation_policies
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add missing policies for proper access control
CREATE POLICY "Users can insert their own patient record" ON public.patients
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own patient record" ON public.patients
FOR UPDATE USING (auth.uid() = id);

-- Add trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();