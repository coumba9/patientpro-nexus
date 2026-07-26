-- Supprimer les triggers dupliqués (3 fois la même fonction sur appointments)
DROP TRIGGER IF EXISTS on_appointment_change ON public.appointments;
DROP TRIGGER IF EXISTS appointment_notification_trigger ON public.appointments;

CREATE OR REPLACE FUNCTION public.notify_appointment_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  doctor_name TEXT;
  patient_name TEXT;
  refund_note TEXT := '';
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
    VALUES (
      NEW.doctor_id,
      'appointment_created',
      'Nouveau rendez-vous',
      'Vous avez reçu une nouvelle demande de rendez-vous',
      NEW.id,
      'medium'
    );

    INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
    VALUES (
      NEW.patient_id,
      'appointment_created',
      'Rendez-vous créé',
      'Votre demande de rendez-vous a été envoyée au médecin',
      NEW.id,
      'medium'
    );

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT CONCAT(first_name, ' ', last_name) INTO doctor_name FROM public.profiles WHERE id = NEW.doctor_id;
    SELECT CONCAT(first_name, ' ', last_name) INTO patient_name FROM public.profiles WHERE id = NEW.patient_id;

    IF NEW.status = 'cancelled' THEN
      -- Annulation par le médecin -> notification détaillée au patient
      IF NEW.cancelled_by IS DISTINCT FROM NEW.patient_id THEN
        IF NEW.payment_status = 'completed' OR NEW.payment_status = 'paid' THEN
          refund_note := CONCAT(' Votre paiement de ', COALESCE(NEW.payment_amount, 0), ' FCFA sera remboursé ou reporté sur un nouveau rendez-vous.');
        END IF;

        INSERT INTO notifications (user_id, type, title, message, appointment_id, priority, metadata)
        VALUES (
          NEW.patient_id,
          'appointment_cancelled',
          'Rendez-vous annulé par le médecin',
          CONCAT(
            'Dr. ', COALESCE(NULLIF(TRIM(doctor_name), ''), 'Votre médecin'),
            ' a annulé votre rendez-vous du ', TO_CHAR(NEW.date, 'DD/MM/YYYY'), ' à ', TO_CHAR(NEW.time, 'HH24:MI'), '.',
            ' Motif : ', COALESCE(NULLIF(TRIM(NEW.cancellation_reason), ''), 'non précisé'), '.',
            refund_note,
            ' Vous pouvez reprendre rendez-vous à une autre date.'
          ),
          NEW.id,
          'high',
          jsonb_build_object(
            'cancelled_by', 'doctor',
            'doctor_id', NEW.doctor_id,
            'reason', NEW.cancellation_reason,
            'payment_status', NEW.payment_status,
            'payment_amount', NEW.payment_amount
          )
        );
      ELSE
        -- Annulation par le patient -> notification au médecin
        INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
        VALUES (
          NEW.doctor_id,
          'appointment_cancelled',
          'Rendez-vous annulé par le patient',
          CONCAT(
            COALESCE(NULLIF(TRIM(patient_name), ''), 'Un patient'),
            ' a annulé son rendez-vous du ', TO_CHAR(NEW.date, 'DD/MM/YYYY'), ' à ', TO_CHAR(NEW.time, 'HH24:MI'),
            '. Motif : ', COALESCE(NULLIF(TRIM(NEW.cancellation_reason), ''), 'non précisé')
          ),
          NEW.id,
          'high'
        );

        INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
        VALUES (
          NEW.patient_id,
          'appointment_cancelled',
          'Rendez-vous annulé',
          'Votre rendez-vous a bien été annulé.',
          NEW.id,
          'medium'
        );
      END IF;

      RETURN NEW;
    END IF;

    -- Autres changements de statut
    INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
    VALUES (
      NEW.patient_id,
      'appointment_status_changed',
      'Statut du rendez-vous mis à jour',
      CASE
        WHEN NEW.status = 'confirmed' THEN 'Votre rendez-vous a été confirmé'
        WHEN NEW.status = 'completed' THEN 'Votre rendez-vous a été marqué comme terminé'
        ELSE 'Le statut de votre rendez-vous a été mis à jour'
      END,
      NEW.id,
      'medium'
    );

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE'
     AND (OLD.cancellation_reason IS DISTINCT FROM NEW.cancellation_reason OR OLD.cancelled_by IS DISTINCT FROM NEW.cancelled_by)
     AND NEW.cancelled_by = NEW.patient_id
     AND NEW.status IS NOT DISTINCT FROM OLD.status THEN
    INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
    VALUES (
      NEW.doctor_id,
      'appointment_reschedule_request',
      'Demande de report de rendez-vous',
      CONCAT('Un patient souhaite reporter son rendez-vous. Raison: ', COALESCE(NEW.cancellation_reason, 'Non spécifiée')),
      NEW.id,
      'medium'
    );
  END IF;

  RETURN NEW;
END;
$function$;