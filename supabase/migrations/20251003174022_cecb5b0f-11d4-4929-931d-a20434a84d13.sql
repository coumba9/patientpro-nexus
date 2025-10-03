-- Fix search_path for security in notification functions
CREATE OR REPLACE FUNCTION notify_appointment_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify doctor when new appointment is created
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
    
    -- Notify patient about appointment confirmation
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
  
  -- Notify both parties when appointment status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Notify patient when doctor updates status
    INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
    VALUES (
      NEW.patient_id,
      'appointment_status_changed',
      'Statut du rendez-vous mis à jour',
      CASE 
        WHEN NEW.status = 'confirmed' THEN 'Votre rendez-vous a été confirmé'
        WHEN NEW.status = 'cancelled' THEN 'Votre rendez-vous a été annulé'
        WHEN NEW.status = 'completed' THEN 'Votre rendez-vous a été marqué comme terminé'
        ELSE 'Le statut de votre rendez-vous a été mis à jour'
      END,
      NEW.id,
      'high'
    );
    
    -- Notify doctor when patient cancels
    IF NEW.cancelled_by = NEW.patient_id THEN
      INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
      VALUES (
        NEW.doctor_id,
        'appointment_cancelled',
        'Rendez-vous annulé',
        'Un patient a annulé son rendez-vous',
        NEW.id,
        'medium'
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix search_path for medical record notifications
CREATE OR REPLACE FUNCTION notify_medical_record_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify patient when medical record is created
    INSERT INTO notifications (user_id, type, title, message, priority)
    VALUES (
      NEW.patient_id,
      'medical_record',
      'Nouveau dossier médical',
      'Un nouveau dossier médical a été ajouté à votre profil',
      'medium'
    );
    
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$;