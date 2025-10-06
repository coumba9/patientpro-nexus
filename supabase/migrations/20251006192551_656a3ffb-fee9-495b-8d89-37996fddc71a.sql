-- Créer la table messages pour la communication bidirectionnelle docteur-patient
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  appointment_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour messages
CREATE POLICY "Users can view messages they sent or received"
  ON public.messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Authenticated users can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Ajouter un trigger pour mettre à jour updated_at
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ajouter une table documents pour les documents médicaux
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  title text NOT NULL,
  type text NOT NULL,
  file_url text,
  file_size integer,
  is_signed boolean NOT NULL DEFAULT false,
  signed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour documents
CREATE POLICY "Users can view documents they're involved in"
  ON public.documents
  FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Doctors can create documents"
  ON public.documents
  FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their documents"
  ON public.documents
  FOR UPDATE
  USING (auth.uid() = doctor_id);

-- Ajouter un trigger pour mettre à jour updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Améliorer le trigger de notifications pour inclure les annulations/reports
CREATE OR REPLACE FUNCTION public.notify_appointment_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
    
    -- Notify doctor when patient cancels or reschedules
    IF NEW.status = 'cancelled' AND NEW.cancelled_by = NEW.patient_id THEN
      INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
      VALUES (
        NEW.doctor_id,
        'appointment_cancelled',
        'Rendez-vous annulé par le patient',
        CONCAT('Un patient a annulé son rendez-vous. Raison: ', COALESCE(NEW.cancellation_reason, 'Non spécifiée')),
        NEW.id,
        'high'
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Notify doctor when cancellation details are updated (reschedule request)
  IF TG_OP = 'UPDATE' AND (OLD.cancellation_reason IS DISTINCT FROM NEW.cancellation_reason OR OLD.cancelled_by IS DISTINCT FROM NEW.cancelled_by) AND NEW.cancelled_by = NEW.patient_id THEN
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
$$;