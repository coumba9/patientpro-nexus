-- Add trigger for automatic appointment notifications
CREATE OR REPLACE FUNCTION notify_appointment_changes()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_appointment_change ON appointments;

-- Create trigger for appointments
CREATE TRIGGER on_appointment_change
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_changes();

-- Add trigger for medical records notifications
CREATE OR REPLACE FUNCTION notify_medical_record_changes()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_medical_record_change ON medical_records;

-- Create trigger for medical records
CREATE TRIGGER on_medical_record_change
  AFTER INSERT ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION notify_medical_record_changes();

-- Enable realtime for important tables (set replica identity)
ALTER TABLE appointments REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE reminders REPLICA IDENTITY FULL;