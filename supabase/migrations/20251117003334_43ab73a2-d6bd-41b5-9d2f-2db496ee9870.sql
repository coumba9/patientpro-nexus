-- Create a secure function to fetch public doctor info (name + specialty)
CREATE OR REPLACE FUNCTION public.get_doctor_brief(doctor_id uuid)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  email text,
  specialty_name text,
  specialty_id uuid
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    p.first_name,
    p.last_name,
    p.email,
    s.name AS specialty_name,
    d.specialty_id
  FROM public.doctors d
  LEFT JOIN public.profiles p ON p.id = d.id
  LEFT JOIN public.specialties s ON s.id = d.specialty_id
  WHERE d.id = get_doctor_brief.doctor_id;
END;
$$;