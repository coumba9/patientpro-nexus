-- Supprimer le rôle admin de l'utilisateur patient pour éviter la confusion
DELETE FROM user_roles 
WHERE user_id = '335f4482-99d7-480d-81e4-a99fe8c5c394' 
AND role = 'admin';

-- Créer un profil pour l'utilisateur (qui sera maintenant uniquement patient)
INSERT INTO profiles (id, first_name, last_name, email)
VALUES ('335f4482-99d7-480d-81e4-a99fe8c5c394', 'Patient', 'Test', 'mfshopp21@gmail.com')
ON CONFLICT (id) DO UPDATE SET
first_name = EXCLUDED.first_name,
last_name = EXCLUDED.last_name,
email = EXCLUDED.email;

-- Créer un entry patient pour cet utilisateur
INSERT INTO patients (id, gender, birth_date)
VALUES ('335f4482-99d7-480d-81e4-a99fe8c5c394', 'male', '1990-01-01')
ON CONFLICT (id) DO NOTHING;