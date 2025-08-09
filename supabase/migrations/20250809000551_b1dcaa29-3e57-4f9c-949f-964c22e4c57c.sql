-- Insérer manuellement les données de l'utilisateur existant
INSERT INTO public.profiles (id, first_name, last_name, email)
SELECT 
  id,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name,
  email
FROM auth.users
WHERE id = '307b5af6-4fec-4b4d-99f7-c7fcddbca264'
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email;

-- Insérer le rôle de l'utilisateur
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'role', 'patient')::app_role
FROM auth.users
WHERE id = '307b5af6-4fec-4b4d-99f7-c7fcddbca264'
ON CONFLICT (user_id, role) DO NOTHING;

-- Insérer dans la table patients puisque c'est un patient
INSERT INTO public.patients (id)
SELECT id
FROM auth.users
WHERE id = '307b5af6-4fec-4b4d-99f7-c7fcddbca264'
  AND raw_user_meta_data->>'role' = 'patient'
ON CONFLICT (id) DO NOTHING;