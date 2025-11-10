-- Sécuriser la table profiles: exiger l'authentification pour toutes les opérations SELECT
-- Cette politique s'applique avant les autres et refuse l'accès aux utilisateurs non authentifiés
CREATE POLICY "Require authentication for profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Sécuriser la table patients: exiger l'authentification pour toutes les opérations SELECT
-- Cette politique protège les données médicales sensibles contre l'accès non authentifié
CREATE POLICY "Require authentication for patients"
ON public.patients
FOR SELECT
TO anon
USING (false);

-- Note: Les utilisateurs authentifiés continueront d'utiliser les politiques existantes
-- qui permettent l'accès uniquement à leurs propres données ou en tant qu'admin/docteur