-- Fix search_path for get_available_doctors function
CREATE OR REPLACE FUNCTION public.get_available_doctors(specialty_filter uuid DEFAULT NULL::uuid, verified_only boolean DEFAULT true)
RETURNS TABLE(id uuid, first_name text, last_name text, email text, specialty_name text, specialty_id uuid, years_of_experience integer, license_number text, is_verified boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    p.first_name,
    p.last_name,
    p.email,
    s.name as specialty_name,
    d.specialty_id,
    d.years_of_experience,
    d.license_number,
    d.is_verified
  FROM doctors d
  LEFT JOIN profiles p ON d.id = p.id
  LEFT JOIN specialties s ON d.specialty_id = s.id
  WHERE 
    (NOT verified_only OR d.is_verified = TRUE)
    AND (specialty_filter IS NULL OR d.specialty_id = specialty_filter)
    AND p.first_name IS NOT NULL
    AND p.last_name IS NOT NULL
  ORDER BY d.is_verified DESC, d.years_of_experience DESC;
END;
$$;