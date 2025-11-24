-- Créer une fonction pour mettre à jour le total_doctors dans specialties
CREATE OR REPLACE FUNCTION update_specialty_doctor_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le total_doctors pour l'ancienne spécialité (si changement)
  IF TG_OP = 'UPDATE' AND OLD.specialty_id IS DISTINCT FROM NEW.specialty_id THEN
    UPDATE specialties
    SET total_doctors = (
      SELECT COUNT(*) FROM doctors WHERE specialty_id = OLD.specialty_id
    )
    WHERE id = OLD.specialty_id;
  END IF;

  -- Mettre à jour le total_doctors pour la nouvelle/actuelle spécialité
  IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.specialty_id IS NOT NULL THEN
    UPDATE specialties
    SET total_doctors = (
      SELECT COUNT(*) FROM doctors WHERE specialty_id = NEW.specialty_id
    )
    WHERE id = NEW.specialty_id;
  END IF;

  -- Gérer la suppression
  IF TG_OP = 'DELETE' AND OLD.specialty_id IS NOT NULL THEN
    UPDATE specialties
    SET total_doctors = (
      SELECT COUNT(*) FROM doctors WHERE specialty_id = OLD.specialty_id
    )
    WHERE id = OLD.specialty_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour mettre à jour automatiquement total_doctors
DROP TRIGGER IF EXISTS update_specialty_doctor_count_trigger ON doctors;
CREATE TRIGGER update_specialty_doctor_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON doctors
FOR EACH ROW
EXECUTE FUNCTION update_specialty_doctor_count();

-- Initialiser les totaux existants
UPDATE specialties
SET total_doctors = (
  SELECT COUNT(*) FROM doctors WHERE doctors.specialty_id = specialties.id
);