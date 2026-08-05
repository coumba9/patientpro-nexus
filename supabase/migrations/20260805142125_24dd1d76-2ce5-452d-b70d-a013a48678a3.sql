-- 1. PRACTICE LOCATIONS
CREATE TABLE IF NOT EXISTS public.practice_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'cabinet',
  address text NOT NULL,
  city text,
  postal_code text,
  phone_number text,
  latitude numeric,
  longitude numeric,
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_locations TO authenticated;
GRANT ALL ON public.practice_locations TO service_role;

ALTER TABLE public.practice_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_locations FORCE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active locations"
  ON public.practice_locations FOR SELECT TO authenticated
  USING (is_active = true OR doctor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors manage own locations"
  ON public.practice_locations FOR ALL TO authenticated
  USING (doctor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (doctor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_practice_locations_doctor ON public.practice_locations(doctor_id);

CREATE TRIGGER update_practice_locations_updated_at
  BEFORE UPDATE ON public.practice_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. CONSULTATION REASONS
CREATE TABLE IF NOT EXISTS public.consultation_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  duration_minutes integer NOT NULL DEFAULT 30,
  price numeric NOT NULL DEFAULT 0,
  is_first_visit boolean NOT NULL DEFAULT false,
  allows_teleconsultation boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultation_reasons TO authenticated;
GRANT ALL ON public.consultation_reasons TO service_role;

ALTER TABLE public.consultation_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_reasons FORCE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active reasons"
  ON public.consultation_reasons FOR SELECT TO authenticated
  USING (is_active = true OR doctor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors manage own reasons"
  ON public.consultation_reasons FOR ALL TO authenticated
  USING (doctor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (doctor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_consultation_reasons_doctor ON public.consultation_reasons(doctor_id);

CREATE TRIGGER update_consultation_reasons_updated_at
  BEFORE UPDATE ON public.consultation_reasons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. CONGES / ABSENCES PONCTUELLES
ALTER TABLE public.doctor_unavailability_periods
  ADD COLUMN IF NOT EXISTS start_time time,
  ADD COLUMN IF NOT EXISTS end_time time,
  ADD COLUMN IF NOT EXISTS is_full_day boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'conge';

-- 4. LIEN CRENEAUX / RDV
ALTER TABLE public.doctor_availability_slots
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.practice_locations(id) ON DELETE SET NULL;

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.practice_locations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reason_id uuid REFERENCES public.consultation_reasons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 30;

-- 5. MODERATION DES AVIS
ALTER TABLE public.ratings
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS moderated_by uuid,
  ADD COLUMN IF NOT EXISTS moderated_at timestamptz,
  ADD COLUMN IF NOT EXISTS moderation_reason text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ratings_moderation_status_check'
  ) THEN
    ALTER TABLE public.ratings
      ADD CONSTRAINT ratings_moderation_status_check
      CHECK (moderation_status IN ('pending','approved','rejected'));
  END IF;
END $$;

-- Les avis existants sont considérés comme approuvés
UPDATE public.ratings SET moderation_status = 'approved' WHERE moderation_status = 'pending';

DROP POLICY IF EXISTS "Admins can moderate ratings" ON public.ratings;
CREATE POLICY "Admins can moderate ratings"
  ON public.ratings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view approved ratings" ON public.ratings;
CREATE POLICY "Users can view approved ratings"
  ON public.ratings FOR SELECT TO authenticated
  USING (moderation_status = 'approved' OR patient_id = auth.uid() OR doctor_id = auth.uid());

-- Stats: seulement les avis approuvés
CREATE OR REPLACE FUNCTION public.get_doctor_rating_stats(doctor_ids uuid[] DEFAULT NULL::uuid[])
 RETURNS TABLE(doctor_id uuid, average_rating numeric, rating_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT r.doctor_id,
         ROUND(AVG(r.rating)::numeric, 1) AS average_rating,
         COUNT(*)::bigint AS rating_count
  FROM public.ratings r
  WHERE (doctor_ids IS NULL OR r.doctor_id = ANY(doctor_ids))
    AND r.moderation_status = 'approved'
  GROUP BY r.doctor_id;
$function$;