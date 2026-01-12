-- 1. Create storage bucket for signatures
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create storage policies for signatures bucket
CREATE POLICY "Doctors can upload their signatures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'signatures' AND
  EXISTS (SELECT 1 FROM public.doctors WHERE id = auth.uid())
);

CREATE POLICY "Anyone can view signatures"
ON storage.objects
FOR SELECT
USING (bucket_id = 'signatures');

CREATE POLICY "Doctors can update their signatures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'signatures' AND
  EXISTS (SELECT 1 FROM public.doctors WHERE id = auth.uid())
);

-- 3. Add signature_url column to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS signature_url TEXT;

-- 4. Create trigger function to notify patient when document is signed
CREATE OR REPLACE FUNCTION public.notify_document_signed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  doc_title TEXT;
  doctor_name TEXT;
BEGIN
  -- Only trigger when is_signed changes from false to true
  IF NEW.is_signed = true AND (OLD.is_signed IS NULL OR OLD.is_signed = false) THEN
    -- Get document title
    doc_title := NEW.title;
    
    -- Get doctor name
    SELECT CONCAT(first_name, ' ', last_name) INTO doctor_name
    FROM public.profiles
    WHERE id = NEW.doctor_id;
    
    -- Create notification for patient
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      priority,
      metadata
    ) VALUES (
      NEW.patient_id,
      'document_signed',
      'Document signé par votre médecin',
      CONCAT('Le document "', doc_title, '" a été signé par Dr. ', COALESCE(doctor_name, 'Votre médecin'), '. Vous pouvez maintenant le télécharger.'),
      'high',
      jsonb_build_object(
        'document_id', NEW.id,
        'document_title', doc_title,
        'doctor_id', NEW.doctor_id,
        'signed_at', NEW.signed_at
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 5. Create trigger on documents table
DROP TRIGGER IF EXISTS trigger_document_signed ON public.documents;
CREATE TRIGGER trigger_document_signed
  AFTER UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_document_signed();