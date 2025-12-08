-- Fix search_path for update_specialty_doctor_count function
CREATE OR REPLACE FUNCTION public.update_specialty_doctor_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Mettre à jour le total_doctors pour l'ancienne spécialité (si changement)
  IF TG_OP = 'UPDATE' AND OLD.specialty_id IS DISTINCT FROM NEW.specialty_id THEN
    UPDATE public.specialties
    SET total_doctors = (
      SELECT COUNT(*) FROM public.doctors WHERE specialty_id = OLD.specialty_id
    )
    WHERE id = OLD.specialty_id;
  END IF;

  -- Mettre à jour le total_doctors pour la nouvelle/actuelle spécialité
  IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.specialty_id IS NOT NULL THEN
    UPDATE public.specialties
    SET total_doctors = (
      SELECT COUNT(*) FROM public.doctors WHERE specialty_id = NEW.specialty_id
    )
    WHERE id = NEW.specialty_id;
  END IF;

  -- Gérer la suppression
  IF TG_OP = 'DELETE' AND OLD.specialty_id IS NOT NULL THEN
    UPDATE public.specialties
    SET total_doctors = (
      SELECT COUNT(*) FROM public.doctors WHERE specialty_id = OLD.specialty_id
    )
    WHERE id = OLD.specialty_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;