-- Create a function that returns limited profile information based on user relationship
-- This prevents exposure of sensitive contact information to unrelated users

CREATE OR REPLACE FUNCTION public.get_safe_profile(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  avatar_url text,
  email text,
  phone_number text,
  address text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  is_admin boolean;
  is_own_profile boolean;
  has_active_appointment boolean;
BEGIN
  -- Check if viewing own profile
  is_own_profile := (current_user_id = target_user_id);
  
  -- Check if current user is admin
  is_admin := public.has_role(current_user_id, 'admin');
  
  -- Check for active appointment relationship (within last 30 days or future)
  SELECT EXISTS(
    SELECT 1 FROM public.appointments a
    WHERE (
      (a.patient_id = current_user_id AND a.doctor_id = target_user_id) OR
      (a.doctor_id = current_user_id AND a.patient_id = target_user_id)
    )
    AND a.status IN ('pending', 'confirmed', 'completed')
    AND (a.date >= CURRENT_DATE - INTERVAL '30 days' OR a.date >= CURRENT_DATE)
  ) INTO has_active_appointment;
  
  -- Return full profile for own profile or admin
  IF is_own_profile OR is_admin THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.avatar_url,
      p.email,
      p.phone_number,
      p.address
    FROM public.profiles p
    WHERE p.id = target_user_id;
  -- Return limited profile for active appointment relationship
  ELSIF has_active_appointment THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.avatar_url,
      NULL::text as email,  -- Hide email
      NULL::text as phone_number,  -- Hide phone
      NULL::text as address  -- Hide address
    FROM public.profiles p
    WHERE p.id = target_user_id;
  ELSE
    -- No access - return empty
    RETURN;
  END IF;
END;
$$;

-- Drop the overly permissive policy that exposes contact info
DROP POLICY IF EXISTS "Users can view related profiles" ON public.profiles;

-- Create a more restrictive policy for direct profile access
-- Users can only view their own profile or admins can view all
CREATE POLICY "Users can view own profile or via function"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id 
  OR public.is_current_user_admin() = true
);

-- Grant execute on the safe profile function
GRANT EXECUTE ON FUNCTION public.get_safe_profile(uuid) TO authenticated;