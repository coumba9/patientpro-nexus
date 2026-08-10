CREATE OR REPLACE FUNCTION public.notify_reschedule_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  patient_name TEXT;
  doctor_name TEXT;
BEGIN
  SELECT CONCAT(first_name, ' ', last_name) INTO patient_name FROM public.profiles WHERE id = NEW.patient_id;
  SELECT CONCAT(first_name, ' ', last_name) INTO doctor_name FROM public.profiles WHERE id = NEW.doctor_id;

  -- 1. Le patient demande un report -> notifier le médecin
  IF NEW.status = 'pending_reschedule' AND OLD.status IS DISTINCT FROM 'pending_reschedule' THEN
    INSERT INTO public.notifications (user_id, type, title, message, appointment_id, priority)
    VALUES (
      NEW.doctor_id,
      'appointment_reschedule_request',
      'Demande de report de rendez-vous',
      CONCAT(
        COALESCE(NULLIF(TRIM(patient_name), ''), 'Un patient'),
        ' souhaite reporter son rendez-vous du ',
        TO_CHAR(COALESCE(NEW.previous_date, OLD.date), 'DD/MM/YYYY'), ' à ', TO_CHAR(COALESCE(NEW.previous_time, OLD.time), 'HH24:MI'),
        ' au ', TO_CHAR(NEW.date, 'DD/MM/YYYY'), ' à ', TO_CHAR(NEW.time, 'HH24:MI'),
        '. Motif : ', COALESCE(NULLIF(TRIM(NEW.reschedule_reason), ''), 'non précisé')
      ),
      NEW.id,
      'high'
    );
    RETURN NEW;
  END IF;

  -- 2. Le médecin traite la demande de report
  IF OLD.status = 'pending_reschedule' AND NEW.status = 'confirmed' THEN
    IF NEW.date = OLD.date AND NEW.time = OLD.time THEN
      INSERT INTO public.notifications (user_id, type, title, message, appointment_id, priority)
      VALUES (
        NEW.patient_id,
        'appointment_reschedule_accepted',
        'Report accepté',
        CONCAT('Dr. ', COALESCE(NULLIF(TRIM(doctor_name), ''), 'Votre médecin'),
          ' a accepté votre report. Nouveau rendez-vous : ',
          TO_CHAR(NEW.date, 'DD/MM/YYYY'), ' à ', TO_CHAR(NEW.time, 'HH24:MI'), '.'),
        NEW.id,
        'high'
      );
    ELSE
      INSERT INTO public.notifications (user_id, type, title, message, appointment_id, priority)
      VALUES (
        NEW.patient_id,
        'appointment_reschedule_rejected',
        'Report refusé',
        CONCAT('Dr. ', COALESCE(NULLIF(TRIM(doctor_name), ''), 'Votre médecin'),
          ' a refusé votre demande de report. Votre rendez-vous est maintenu le ',
          TO_CHAR(NEW.date, 'DD/MM/YYYY'), ' à ', TO_CHAR(NEW.time, 'HH24:MI'), '.'),
        NEW.id,
        'high'
      );
    END IF;
    RETURN NEW;
  END IF;

  -- 3. Le médecin déplace lui-même le rendez-vous
  IF NEW.status = 'confirmed' AND OLD.status = 'confirmed'
     AND (NEW.date IS DISTINCT FROM OLD.date OR NEW.time IS DISTINCT FROM OLD.time)
     AND NEW.reschedule_requested_by IS DISTINCT FROM NEW.patient_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, appointment_id, priority)
    VALUES (
      NEW.patient_id,
      'appointment_rescheduled',
      'Rendez-vous déplacé par le médecin',
      CONCAT('Dr. ', COALESCE(NULLIF(TRIM(doctor_name), ''), 'Votre médecin'),
        ' a déplacé votre rendez-vous du ', TO_CHAR(OLD.date, 'DD/MM/YYYY'), ' à ', TO_CHAR(OLD.time, 'HH24:MI'),
        ' au ', TO_CHAR(NEW.date, 'DD/MM/YYYY'), ' à ', TO_CHAR(NEW.time, 'HH24:MI'), '.'),
      NEW.id,
      'high'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_reschedule_changes ON public.appointments;
CREATE TRIGGER trigger_notify_reschedule_changes
AFTER UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.notify_reschedule_changes();