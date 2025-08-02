-- Réparer la fonction handle_new_user pour les nouvelles inscriptions

-- D'abord supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recréer la fonction avec une meilleure gestion d'erreurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Insert into profiles avec gestion d'erreur
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
  
  -- Insert role into user_roles table avec gestion d'erreur
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
    -- Log l'erreur mais ne pas faire échouer l'inscription
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();