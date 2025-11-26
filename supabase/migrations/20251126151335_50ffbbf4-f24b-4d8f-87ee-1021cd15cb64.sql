-- Add missing fields to profiles table for phone and address
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add medical history fields to patients table
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS medical_history JSONB DEFAULT '{"chronic_diseases": [], "medical_background": [], "current_treatments": []}'::jsonb,
ADD COLUMN IF NOT EXISTS beneficiaries JSONB DEFAULT '[]'::jsonb;

-- Create vaccinations table
CREATE TABLE IF NOT EXISTS public.vaccinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  vaccine_name TEXT NOT NULL,
  vaccination_date DATE NOT NULL,
  next_dose_date DATE,
  administered_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_results table for analyses
CREATE TABLE IF NOT EXISTS public.lab_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  doctor_id UUID,
  test_name TEXT NOT NULL,
  test_date DATE NOT NULL,
  results TEXT,
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical_images table for radios/echographies
CREATE TABLE IF NOT EXISTS public.medical_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  doctor_id UUID,
  image_type TEXT NOT NULL,
  image_date DATE NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  assigned_to UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vaccinations
CREATE POLICY "Users can view their own vaccinations"
  ON public.vaccinations FOR SELECT
  USING (patient_id = auth.uid() OR EXISTS (
    SELECT 1 FROM appointments 
    WHERE doctor_id = auth.uid() AND patient_id = vaccinations.patient_id
  ));

CREATE POLICY "Doctors can manage vaccinations"
  ON public.vaccinations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM appointments 
    WHERE doctor_id = auth.uid() AND patient_id = vaccinations.patient_id
  ));

-- RLS Policies for lab_results
CREATE POLICY "Users can view their own lab results"
  ON public.lab_results FOR SELECT
  USING (patient_id = auth.uid() OR doctor_id = auth.uid());

CREATE POLICY "Doctors can manage lab results"
  ON public.lab_results FOR ALL
  USING (doctor_id = auth.uid());

-- RLS Policies for medical_images
CREATE POLICY "Users can view their own medical images"
  ON public.medical_images FOR SELECT
  USING (patient_id = auth.uid() OR doctor_id = auth.uid());

CREATE POLICY "Doctors can manage medical images"
  ON public.medical_images FOR ALL
  USING (doctor_id = auth.uid());

-- RLS Policies for support_tickets
CREATE POLICY "Users can view their own tickets"
  ON public.support_tickets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tickets"
  ON public.support_tickets FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all tickets"
  ON public.support_tickets FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_vaccinations_updated_at
  BEFORE UPDATE ON public.vaccinations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_results_updated_at
  BEFORE UPDATE ON public.lab_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_images_updated_at
  BEFORE UPDATE ON public.medical_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();