
-- 1. Consolidation des politiques d'insertion sur user_roles
-- "Admins can manage all roles" (PERMISSIVE, FOR ALL) autorise déjà l'insertion aux admins,
-- la politique PERMISSIVE dédiée fait doublon : on la supprime et on conserve la RESTRICTIVE.
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;

-- 2. Politique UPDATE explicite pour le bucket doctor-documents
DROP POLICY IF EXISTS "Owners and admins can update doctor documents" ON storage.objects;
CREATE POLICY "Owners and admins can update doctor documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'doctor-documents'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
)
WITH CHECK (
  bucket_id = 'doctor-documents'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);
