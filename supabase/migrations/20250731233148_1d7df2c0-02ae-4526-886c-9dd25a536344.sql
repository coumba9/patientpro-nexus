-- Fix search_path for remaining functions
CREATE OR REPLACE FUNCTION public.increment_specialty_doctor_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.specialty_id IS NOT NULL THEN
    UPDATE public.specialties
    SET total_doctors = total_doctors + 1
    WHERE id = NEW.specialty_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_cancel_appointment(appointment_id UUID, user_id UUID, user_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  appointment_record RECORD;
  policy_hours INTEGER;
  hours_before_appointment INTEGER;
BEGIN
  -- Récupérer les détails du rendez-vous
  SELECT date, time, doctor_id, patient_id, status
  INTO appointment_record
  FROM public.appointments
  WHERE id = appointment_id;

  -- Vérifier si le rendez-vous existe et n'est pas déjà annulé
  IF NOT FOUND OR appointment_record.status = 'cancelled' THEN
    RETURN FALSE;
  END IF;

  -- Vérifier si l'utilisateur a le droit d'annuler ce rendez-vous
  IF user_role = 'doctor' AND appointment_record.doctor_id != user_id THEN
    RETURN FALSE;
  END IF;

  IF user_role = 'patient' AND appointment_record.patient_id != user_id THEN
    RETURN FALSE;
  END IF;

  -- Récupérer la politique d'annulation
  SELECT minimum_hours_before
  INTO policy_hours
  FROM public.cancellation_policies
  WHERE user_type = user_role;

  -- Si aucune politique trouvée, utiliser les valeurs par défaut
  IF NOT FOUND THEN
    policy_hours := CASE 
      WHEN user_role = 'doctor' THEN 2
      WHEN user_role = 'patient' THEN 24
      ELSE 24
    END;
  END IF;

  -- Calculer les heures avant le rendez-vous
  SELECT EXTRACT(EPOCH FROM (
    (appointment_record.date + appointment_record.time) - NOW()
  )) / 3600 INTO hours_before_appointment;

  -- Vérifier si l'annulation est dans les délais
  RETURN hours_before_appointment >= policy_hours;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;