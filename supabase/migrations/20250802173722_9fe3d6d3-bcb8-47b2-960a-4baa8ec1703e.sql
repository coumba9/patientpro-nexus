-- Réparer la base de données en recréant le type app_role et les fonctions essentielles

-- 1. Recréer le type app_role
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'patient');
    END IF;
END $$;

-- 2. Recréer la fonction has_role si elle n'existe pas ou est cassée
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 3. Recréer la fonction get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 4. Vérifier que la table user_roles existe et a la bonne structure
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        CREATE TABLE public.user_roles (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            role app_role NOT NULL,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            updated_at timestamp with time zone DEFAULT now() NOT NULL,
            UNIQUE(user_id, role)
        );
        
        ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
        
        -- Recréer les politiques RLS pour user_roles
        CREATE POLICY "Admins can manage all roles" ON public.user_roles
        FOR ALL TO authenticated
        USING (public.has_role(auth.uid(), 'admin'::app_role));
        
        CREATE POLICY "Users can view their own roles" ON public.user_roles
        FOR SELECT TO authenticated
        USING (auth.uid() = user_id);
    END IF;
END $$;