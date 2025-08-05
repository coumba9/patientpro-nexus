-- RECONSTRUCTION COMPLÈTE DU SYSTÈME D'AUTHENTIFICATION

-- 1. Supprimer et recréer le type app_role
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'patient');

-- 2. Vérifier et réparer la table user_roles
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, role)
);

-- 3. Activer RLS sur user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Recréer toutes les fonctions essentielles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
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
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 5. Fonction pour mise à jour automatique des timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 6. Trigger pour user_roles
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Fonction pour les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Insert into profiles
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
  
  -- Insert role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')::app_role
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
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
      CASE 
        WHEN NEW.raw_user_meta_data->>'speciality' IS NOT NULL 
        THEN (NEW.raw_user_meta_data->>'speciality')::UUID
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

-- 8. Recréer le trigger pour les nouveaux utilisateurs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Recréer les politiques RLS pour user_roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 10. Ajouter quelques spécialités de base si la table est vide
INSERT INTO public.specialties (name, description) 
VALUES 
    ('Médecine Générale', 'Consultation et soins de médecine générale'),
    ('Cardiologie', 'Spécialiste du cœur et des vaisseaux'),
    ('Dermatologie', 'Spécialiste de la peau'),
    ('Pédiatrie', 'Médecine des enfants')
ON CONFLICT (name) DO NOTHING;