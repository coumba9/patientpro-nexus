-- Vérifier et recréer le trigger pour les notifications d'annulation/report
DROP TRIGGER IF EXISTS trigger_notify_appointment_changes ON appointments;

CREATE TRIGGER trigger_notify_appointment_changes
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_changes();

-- S'assurer que la table appointments utilise REPLICA IDENTITY FULL pour le temps réel
ALTER TABLE appointments REPLICA IDENTITY FULL;

-- Ajouter la table appointments à la publication realtime si ce n'est pas déjà fait
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'appointments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
  END IF;
END $$;