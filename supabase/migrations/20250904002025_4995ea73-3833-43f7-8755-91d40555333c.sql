-- First, let's create some verified doctors with proper specialties
UPDATE doctors SET is_verified = true WHERE id = '23d07077-6dc9-4d93-a6ea-6aab350156a2';

-- Update the existing doctor with a specialty (assuming we have some specialties)
UPDATE doctors 
SET specialty_id = (SELECT id FROM specialties LIMIT 1)
WHERE id = '23d07077-6dc9-4d93-a6ea-6aab350156a2';

-- Enable realtime for appointments table
ALTER TABLE appointments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- Enable realtime for notifications table
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Create a trigger to automatically create notifications when appointments are created/updated
CREATE OR REPLACE FUNCTION notify_appointment_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify doctor when new appointment is created
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (user_id, type, title, message, appointment_id, metadata)
    VALUES (
      NEW.doctor_id,
      'appointment_created',
      'Nouveau rendez-vous',
      'Vous avez reçu une nouvelle demande de rendez-vous',
      NEW.id,
      jsonb_build_object('appointment_id', NEW.id, 'patient_id', NEW.patient_id)
    );
    
    -- Notify patient about appointment confirmation
    INSERT INTO notifications (user_id, type, title, message, appointment_id, metadata)
    VALUES (
      NEW.patient_id,
      'appointment_created',
      'Rendez-vous créé',
      'Votre demande de rendez-vous a été envoyée au médecin',
      NEW.id,
      jsonb_build_object('appointment_id', NEW.id, 'doctor_id', NEW.doctor_id)
    );
    
    RETURN NEW;
  END IF;
  
  -- Notify both parties when appointment status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Notify patient when doctor updates status
    INSERT INTO notifications (user_id, type, title, message, appointment_id, metadata)
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
      jsonb_build_object('appointment_id', NEW.id, 'new_status', NEW.status, 'old_status', OLD.status)
    );
    
    -- Notify doctor when patient cancels
    IF NEW.cancelled_by = NEW.patient_id THEN
      INSERT INTO notifications (user_id, type, title, message, appointment_id, metadata)
      VALUES (
        NEW.doctor_id,
        'appointment_cancelled',
        'Rendez-vous annulé',
        'Un patient a annulé son rendez-vous',
        NEW.id,
        jsonb_build_object('appointment_id', NEW.id, 'cancelled_by', 'patient')
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS appointment_notification_trigger ON appointments;
CREATE TRIGGER appointment_notification_trigger
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_changes();

-- Create a function to get available doctors
CREATE OR REPLACE FUNCTION get_available_doctors(
  specialty_filter UUID DEFAULT NULL,
  verified_only BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  specialty_name TEXT,
  specialty_id UUID,
  years_of_experience INTEGER,
  license_number TEXT,
  is_verified BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    p.first_name,
    p.last_name,
    p.email,
    s.name as specialty_name,
    d.specialty_id,
    d.years_of_experience,
    d.license_number,
    d.is_verified
  FROM doctors d
  LEFT JOIN profiles p ON d.id = p.id
  LEFT JOIN specialties s ON d.specialty_id = s.id
  WHERE 
    (NOT verified_only OR d.is_verified = TRUE)
    AND (specialty_filter IS NULL OR d.specialty_id = specialty_filter)
    AND p.first_name IS NOT NULL
    AND p.last_name IS NOT NULL
  ORDER BY d.is_verified DESC, d.years_of_experience DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;