-- Créer un bucket de stockage pour les documents des médecins
INSERT INTO storage.buckets (id, name, public)
VALUES ('doctor-documents', 'doctor-documents', false);

-- Politique pour permettre aux utilisateurs d'uploader leurs propres documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'doctor-documents');

-- Politique pour permettre aux utilisateurs de voir leurs propres documents
CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'doctor-documents');

-- Politique pour permettre aux admins de voir tous les documents
CREATE POLICY "Admins can view all doctor documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'doctor-documents' AND has_role(auth.uid(), 'admin'));

-- Ajouter des colonnes pour stocker les URLs des documents justificatifs
ALTER TABLE public.doctor_applications
ADD COLUMN diploma_url TEXT,
ADD COLUMN license_url TEXT,
ADD COLUMN other_documents_urls TEXT[];

-- Activer les mises à jour en temps réel pour la table doctor_applications
ALTER TABLE public.doctor_applications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_applications;