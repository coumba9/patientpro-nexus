-- Fix handle_new_user function to properly handle specialty_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')::public.app_role
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
      -- Use specialty_id directly instead of searching by name
      CASE 
        WHEN NEW.raw_user_meta_data->>'speciality' IS NOT NULL 
        AND NEW.raw_user_meta_data->>'speciality' != ''
        THEN (NEW.raw_user_meta_data->>'speciality')::uuid
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
$function$;