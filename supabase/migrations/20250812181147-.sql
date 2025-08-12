-- Fix database function security by adding search_path protection
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
$function$;

-- Update has_role function with search_path protection
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$function$;

-- Update get_current_user_role function with search_path protection
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$function$;

-- Update is_admin function with search_path protection
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT public.has_role(user_id, 'admin'::public.app_role);
$function$;

-- Update update_updated_at_column function with search_path protection
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix notification creation policy - restrict to authenticated users only
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Secure cancellation policies - require authentication
DROP POLICY IF EXISTS "Authenticated users can view cancellation policies" ON public.cancellation_policies;
CREATE POLICY "Authenticated users can view cancellation policies"
ON public.cancellation_policies
FOR SELECT
TO authenticated
USING (true);

-- Add role protection - prevent users from modifying their own roles
CREATE POLICY "Prevent self role modification"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (user_id != auth.uid());

CREATE POLICY "Prevent self role deletion"
ON public.user_roles
FOR DELETE
TO authenticated
USING (user_id != auth.uid());