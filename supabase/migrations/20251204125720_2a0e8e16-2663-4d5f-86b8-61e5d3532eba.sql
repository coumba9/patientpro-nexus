-- Function to automatically schedule SMS reminder 24h before appointment
CREATE OR REPLACE FUNCTION public.schedule_appointment_reminder()
RETURNS TRIGGER AS $$
DECLARE
  reminder_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate reminder time (24 hours before appointment)
  reminder_time := (NEW.date || ' ' || NEW.time)::TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '24 hours';
  
  -- Only create reminder if appointment is in the future and not cancelled
  IF reminder_time > NOW() AND NEW.status NOT IN ('cancelled', 'completed') THEN
    -- Insert reminder for SMS
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_schedule_appointment_reminder ON public.appointments;

-- Create trigger on appointment insert
CREATE TRIGGER trigger_schedule_appointment_reminder
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.schedule_appointment_reminder();

-- Function to update/delete reminders when appointment is updated
CREATE OR REPLACE FUNCTION public.update_appointment_reminder()
RETURNS TRIGGER AS $$
DECLARE
  reminder_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- If appointment is cancelled or completed, mark reminders as cancelled
  IF NEW.status IN ('cancelled', 'completed') THEN
    UPDATE public.reminders 
    SET status = 'cancelled', updated_at = NOW()
    WHERE appointment_id = NEW.id AND status = 'pending';
    RETURN NEW;
  END IF;
  
  -- If date or time changed, update reminder time
  IF OLD.date != NEW.date OR OLD.time != NEW.time THEN
    reminder_time := (NEW.date || ' ' || NEW.time)::TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '24 hours';
    
    -- Update existing pending reminder or create new one
    UPDATE public.reminders 
    SET scheduled_for = reminder_time, updated_at = NOW()
    WHERE appointment_id = NEW.id AND status = 'pending';
    
    -- If no pending reminder exists and time is in future, create one
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_update_appointment_reminder ON public.appointments;

-- Create trigger on appointment update
CREATE TRIGGER trigger_update_appointment_reminder
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_appointment_reminder();

-- Add RLS policy for service role to insert reminders
DROP POLICY IF EXISTS "Service role can manage reminders" ON public.reminders;
CREATE POLICY "Service role can manage reminders" 
ON public.reminders 
FOR ALL 
USING (true)
WITH CHECK (true);