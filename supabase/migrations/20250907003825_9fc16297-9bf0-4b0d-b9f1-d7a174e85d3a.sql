-- Ajouter le rôle admin à l'utilisateur connecté
INSERT INTO user_roles (user_id, role)
VALUES ('335f4482-99d7-480d-81e4-a99fe8c5c394', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Vérifier que l'utilisateur a bien été ajouté
SELECT ur.user_id, ur.role, p.email, p.first_name, p.last_name 
FROM user_roles ur 
LEFT JOIN profiles p ON ur.user_id = p.id 
WHERE ur.user_id = '335f4482-99d7-480d-81e4-a99fe8c5c394';