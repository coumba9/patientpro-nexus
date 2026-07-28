
-- Autoriser les nouveaux statuts de paiement
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_payment_status_check;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_payment_status_check
  CHECK (payment_status = ANY (ARRAY['pending','paid','completed','on_site','failed','refunded','refund_pending','cancelled','forfeited']::text[]));

-- Trigger BEFORE UPDATE : ajuste le paiement quand le médecin annule
CREATE OR REPLACE FUNCTION public.handle_doctor_cancellation_refund()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'cancelled'
     AND OLD.status IS DISTINCT FROM 'cancelled'
     AND NEW.cancelled_by IS DISTINCT FROM NEW.patient_id THEN

    -- Paiement en ligne déjà encaissé -> remboursement à traiter
    IF COALESCE(NEW.payment_status, '') IN ('paid', 'completed') THEN
      NEW.payment_status := 'refund_pending';
    -- Paiement sur place ou non encaissé -> rien à rembourser
    ELSIF COALESCE(NEW.payment_status, '') IN ('on_site', 'pending') THEN
      NEW.payment_status := 'cancelled';
    END IF;

    -- Le patient peut reprendre rendez-vous sans pénalité
    NEW.can_reschedule_without_penalty := true;
    NEW.reschedule_count := 0;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_handle_doctor_cancellation_refund ON public.appointments;
CREATE TRIGGER trigger_handle_doctor_cancellation_refund
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.handle_doctor_cancellation_refund();

-- Répercussion sur la facture (AFTER UPDATE)
CREATE OR REPLACE FUNCTION public.sync_invoice_on_cancellation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' THEN
    IF NEW.payment_status = 'refund_pending' THEN
      UPDATE public.invoices
      SET payment_status = 'refunded', updated_at = now()
      WHERE appointment_id = NEW.id AND payment_status <> 'refunded';
    ELSIF NEW.payment_status = 'cancelled' THEN
      UPDATE public.invoices
      SET payment_status = 'cancelled', updated_at = now()
      WHERE appointment_id = NEW.id AND payment_status = 'pending';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_invoice_on_cancellation ON public.appointments;
CREATE TRIGGER trigger_sync_invoice_on_cancellation
AFTER UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_on_cancellation();

-- Notification patient enrichie (remboursement / report)
CREATE OR REPLACE FUNCTION public.notify_appointment_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  doctor_name TEXT;
  patient_name TEXT;
  refund_note TEXT := '';
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
    VALUES (NEW.doctor_id, 'appointment_created', 'Nouveau rendez-vous',
            'Vous avez reçu une nouvelle demande de rendez-vous', NEW.id, 'medium');

    INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
    VALUES (NEW.patient_id, 'appointment_created', 'Rendez-vous créé',
            'Votre demande de rendez-vous a été envoyée au médecin', NEW.id, 'medium');

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT CONCAT(first_name, ' ', last_name) INTO doctor_name FROM public.profiles WHERE id = NEW.doctor_id;
    SELECT CONCAT(first_name, ' ', last_name) INTO patient_name FROM public.profiles WHERE id = NEW.patient_id;

    IF NEW.status = 'cancelled' THEN
      IF NEW.cancelled_by IS DISTINCT FROM NEW.patient_id THEN
        IF NEW.payment_status = 'refund_pending' THEN
          refund_note := CONCAT(' Votre paiement en ligne de ', COALESCE(NEW.payment_amount, 0),
            ' FCFA est en cours de remboursement (sous 5 jours ouvrés) ; vous pouvez aussi le reporter sur un nouveau rendez-vous sans frais.');
        ELSIF NEW.payment_status = 'cancelled' THEN
          refund_note := ' Aucun montant ne vous sera facturé (paiement prévu sur place). Vous pouvez reprendre rendez-vous gratuitement.';
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
            refund_note
          ),
          NEW.id,
          'high',
          jsonb_build_object(
            'cancelled_by', 'doctor',
            'doctor_id', NEW.doctor_id,
            'reason', NEW.cancellation_reason,
            'payment_status', NEW.payment_status,
            'payment_amount', NEW.payment_amount,
            'refund_pending', (NEW.payment_status = 'refund_pending'),
            'free_reschedule', true
          )
        );
      ELSE
        INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
        VALUES (NEW.doctor_id, 'appointment_cancelled', 'Rendez-vous annulé par le patient',
          CONCAT(COALESCE(NULLIF(TRIM(patient_name), ''), 'Un patient'),
            ' a annulé son rendez-vous du ', TO_CHAR(NEW.date, 'DD/MM/YYYY'), ' à ', TO_CHAR(NEW.time, 'HH24:MI'),
            '. Motif : ', COALESCE(NULLIF(TRIM(NEW.cancellation_reason), ''), 'non précisé')),
          NEW.id, 'high');

        INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
        VALUES (NEW.patient_id, 'appointment_cancelled', 'Rendez-vous annulé',
          'Votre rendez-vous a bien été annulé.', NEW.id, 'medium');
      END IF;

      RETURN NEW;
    END IF;

    INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
    VALUES (
      NEW.patient_id, 'appointment_status_changed', 'Statut du rendez-vous mis à jour',
      CASE
        WHEN NEW.status = 'confirmed' THEN 'Votre rendez-vous a été confirmé'
        WHEN NEW.status = 'completed' THEN 'Votre rendez-vous a été marqué comme terminé'
        ELSE 'Le statut de votre rendez-vous a été mis à jour'
      END,
      NEW.id, 'medium');

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE'
     AND (OLD.cancellation_reason IS DISTINCT FROM NEW.cancellation_reason OR OLD.cancelled_by IS DISTINCT FROM NEW.cancelled_by)
     AND NEW.cancelled_by = NEW.patient_id
     AND NEW.status IS NOT DISTINCT FROM OLD.status THEN
    INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
    VALUES (NEW.doctor_id, 'appointment_reschedule_request', 'Demande de report de rendez-vous',
      CONCAT('Un patient souhaite reporter son rendez-vous. Raison: ', COALESCE(NEW.cancellation_reason, 'Non spécifiée')),
      NEW.id, 'medium');
  END IF;

  RETURN NEW;
END;
$$;
