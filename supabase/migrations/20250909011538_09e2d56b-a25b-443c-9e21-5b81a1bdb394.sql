-- Créer un utilisateur admin temporaire pour les tests
-- (En production, vous devrez créer cet utilisateur via l'interface Supabase)

-- Créer le profil admin
INSERT INTO profiles (id, first_name, last_name, email)
VALUES ('admin-test-uuid-12345', 'Admin', 'System', 'admin@mediconnect.com')
ON CONFLICT (id) DO NOTHING;

-- Créer le rôle admin
INSERT INTO user_roles (user_id, role)
VALUES ('admin-test-uuid-12345', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Créer également une entrée doctor pour l'admin (optionnel)
INSERT INTO doctors (id, license_number, years_of_experience, is_verified)
VALUES ('admin-test-uuid-12345', 'ADMIN-001', 10, true)
ON CONFLICT (id) DO NOTHING;