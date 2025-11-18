-- Create doctor_applications table for pending registrations
CREATE TABLE public.doctor_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  specialty_id UUID REFERENCES public.specialties(id),
  license_number TEXT NOT NULL,
  years_of_experience INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on doctor_applications
ALTER TABLE public.doctor_applications ENABLE ROW LEVEL SECURITY;

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON public.doctor_applications
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update applications (approve/reject)
CREATE POLICY "Admins can update applications"
  ON public.doctor_applications
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow anonymous users to create applications
CREATE POLICY "Anyone can create applications"
  ON public.doctor_applications
  FOR INSERT
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_doctor_applications_updated_at
  BEFORE UPDATE ON public.doctor_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_doctor_applications_status ON public.doctor_applications(status);
CREATE INDEX idx_doctor_applications_created_at ON public.doctor_applications(created_at DESC);