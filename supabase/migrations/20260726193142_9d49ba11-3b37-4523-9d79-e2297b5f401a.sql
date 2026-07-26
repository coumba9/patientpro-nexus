DROP POLICY IF EXISTS "Authenticated users can view all ratings" ON public.ratings;

CREATE OR REPLACE FUNCTION public.get_doctor_rating_stats(doctor_ids uuid[] DEFAULT NULL)
RETURNS TABLE(doctor_id uuid, average_rating numeric, rating_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.doctor_id,
         ROUND(AVG(r.rating)::numeric, 1) AS average_rating,
         COUNT(*)::bigint AS rating_count
  FROM public.ratings r
  WHERE doctor_ids IS NULL OR r.doctor_id = ANY(doctor_ids)
  GROUP BY r.doctor_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_doctor_rating_stats(uuid[]) TO anon, authenticated;