-- Create trigger to automatically assign patient role to new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert patient role for existing users who don't have one
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'patient'
FROM auth.users 
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.users.id
);