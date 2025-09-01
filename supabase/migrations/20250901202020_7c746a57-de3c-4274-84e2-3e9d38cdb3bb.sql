-- Insert patient role for existing users who don't have any role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'patient'::app_role
FROM auth.users 
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.users.id
);