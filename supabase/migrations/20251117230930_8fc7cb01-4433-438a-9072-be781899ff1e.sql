-- Ajouter les colonnes de localisation aux médecins
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS address TEXT;

-- Créer la table de notation des médecins
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  appointment_id UUID NOT NULL UNIQUE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activer RLS sur la table ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Les patients peuvent voir leurs propres notes
CREATE POLICY "Patients can view their own ratings"
ON public.ratings FOR SELECT
USING (auth.uid() = patient_id);

-- Policy: Les médecins peuvent voir les notes les concernant
CREATE POLICY "Doctors can view ratings about them"
ON public.ratings FOR SELECT
USING (auth.uid() = doctor_id);

-- Policy: Les patients peuvent créer une note pour leurs rendez-vous terminés
CREATE POLICY "Patients can create ratings for completed appointments"
ON public.ratings FOR INSERT
WITH CHECK (
  auth.uid() = patient_id
  AND EXISTS (
    SELECT 1 FROM appointments
    WHERE appointments.id = appointment_id
    AND appointments.patient_id = auth.uid()
    AND appointments.status = 'completed'
  )
);

-- Policy: Les patients peuvent mettre à jour leurs propres notes
CREATE POLICY "Patients can update their own ratings"
ON public.ratings FOR UPDATE
USING (auth.uid() = patient_id);

-- Policy: Les admins peuvent tout voir
CREATE POLICY "Admins can view all ratings"
ON public.ratings FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_ratings_updated_at
BEFORE UPDATE ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Créer un index sur appointment_id pour éviter les doublons
CREATE INDEX IF NOT EXISTS idx_ratings_appointment_id ON public.ratings(appointment_id);

-- Créer un index sur doctor_id pour les requêtes de notation moyenne
CREATE INDEX IF NOT EXISTS idx_ratings_doctor_id ON public.ratings(doctor_id);