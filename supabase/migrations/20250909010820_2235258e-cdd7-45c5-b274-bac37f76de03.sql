-- Corriger les problèmes de clés étrangères pour les appointments
-- D'abord, ajoutons les contraintes foreign key manquantes si elles n'existent pas

-- Vérifier si la contrainte exists déjà et l'ajouter si nécessaire
DO $$
BEGIN
    -- Ajouter foreign key pour doctor_id si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'appointments_doctor_id_fkey' 
        AND table_name = 'appointments'
    ) THEN
        ALTER TABLE appointments 
        ADD CONSTRAINT appointments_doctor_id_fkey 
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE;
    END IF;

    -- Ajouter foreign key pour patient_id si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'appointments_patient_id_fkey' 
        AND table_name = 'appointments'
    ) THEN
        ALTER TABLE appointments 
        ADD CONSTRAINT appointments_patient_id_fkey 
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;
    END IF;

    -- Ajouter foreign key pour specialty_id dans doctors si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'doctors_specialty_id_fkey' 
        AND table_name = 'doctors'
    ) THEN
        ALTER TABLE doctors 
        ADD CONSTRAINT doctors_specialty_id_fkey 
        FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE SET NULL;
    END IF;
END $$;