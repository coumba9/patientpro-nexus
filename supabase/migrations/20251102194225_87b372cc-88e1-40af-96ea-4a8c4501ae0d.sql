-- Ajouter le nouveau statut 'awaiting_patient_confirmation' pour le flux de double validation
-- Le flux sera : pending → awaiting_patient_confirmation → confirmed
-- 1. Le patient crée un RDV (statut: pending)
-- 2. Le médecin valide (statut: awaiting_patient_confirmation)
-- 3. Le patient confirme (statut: confirmed)

-- Note: Pas besoin de modifier le type de colonne si 'status' est déjà de type text
-- Les rendez-vous existants restent inchangés