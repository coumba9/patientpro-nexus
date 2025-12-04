-- Fix search_path for the new functions
CREATE OR REPLACE FUNCTION public.schedule_appointment_reminder()
RETURNS TRIGGER AS $$
DECLARE
  reminder_time TIMESTAMP WITH TIME ZONE;
BEGIN
  reminder_time := (NEW.date || ' ' || NEW.time)::TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '24 hours';
  
  IF reminder_time > NOW() AND NEW.status NOT IN ('cancelled', 'completed') THEN
    INSERT INTO public.reminders (
      appointment_id,
      patient_id,
      scheduled_for,
      reminder_type,
      method,
      status,
      attempts
    ) VALUES (
      NEW.id,
      NEW.patient_id,
      reminder_time,
      '24h_before',
      'sms',
      'pending',
      0
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_appointment_reminder()
RETURNS TRIGGER AS $$
DECLARE
  reminder_time TIMESTAMP WITH TIME ZONE;
BEGIN
  IF NEW.status IN ('cancelled', 'completed') THEN
    UPDATE public.reminders 
    SET status = 'cancelled', updated_at = NOW()
    WHERE appointment_id = NEW.id AND status = 'pending';
    RETURN NEW;
  END IF;
  
  IF OLD.date != NEW.date OR OLD.time != NEW.time THEN
    reminder_time := (NEW.date || ' ' || NEW.time)::TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '24 hours';
    
    UPDATE public.reminders 
    SET scheduled_for = reminder_time, updated_at = NOW()
    WHERE appointment_id = NEW.id AND status = 'pending';
    
    IF NOT FOUND AND reminder_time > NOW() THEN
      INSERT INTO public.reminders (
        appointment_id,
        patient_id,
        scheduled_for,
        reminder_type,
        method,
        status,
        attempts
      ) VALUES (
        NEW.id,
        NEW.patient_id,
        reminder_time,
        '24h_before',
        'sms',
        'pending',
        0
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;