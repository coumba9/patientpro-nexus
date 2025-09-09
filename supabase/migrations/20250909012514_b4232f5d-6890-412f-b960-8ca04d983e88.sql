-- Add admin role back to coumba.csw@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users 
WHERE email = 'coumba.csw@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;