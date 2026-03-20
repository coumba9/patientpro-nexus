-- Persist doctor weekly availability slots
CREATE TABLE IF NOT EXISTS public.doctor_availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL,
  day TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT doctor_availability_slots_day_check CHECK (day IN ('Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche')),
  CONSTRAINT doctor_availability_slots_time_check CHECK (start_time < end_time),
  CONSTRAINT doctor_availability_slots_unique UNIQUE (doctor_id, day, start_time, end_time)
);

CREATE INDEX IF NOT EXISTS idx_doctor_availability_slots_doctor_day
  ON public.doctor_availability_slots (doctor_id, day);

ALTER TABLE public.doctor_availability_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors can view own availability slots" ON public.doctor_availability_slots;
CREATE POLICY "Doctors can view own availability slots"
ON public.doctor_availability_slots
FOR SELECT
TO authenticated
USING (auth.uid() = doctor_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Doctors can insert own availability slots" ON public.doctor_availability_slots;
CREATE POLICY "Doctors can insert own availability slots"
ON public.doctor_availability_slots
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = doctor_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Doctors can update own availability slots" ON public.doctor_availability_slots;
CREATE POLICY "Doctors can update own availability slots"
ON public.doctor_availability_slots
FOR UPDATE
TO authenticated
USING (auth.uid() = doctor_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = doctor_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Doctors can delete own availability slots" ON public.doctor_availability_slots;
CREATE POLICY "Doctors can delete own availability slots"
ON public.doctor_availability_slots
FOR DELETE
TO authenticated
USING (auth.uid() = doctor_id OR public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_doctor_availability_slots_updated_at ON public.doctor_availability_slots;
CREATE TRIGGER trg_doctor_availability_slots_updated_at
BEFORE UPDATE ON public.doctor_availability_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Persist doctor holiday / absence periods
CREATE TABLE IF NOT EXISTS public.doctor_unavailability_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT doctor_unavailability_periods_date_check CHECK (start_date <= end_date)
);

CREATE INDEX IF NOT EXISTS idx_doctor_unavailability_periods_doctor
  ON public.doctor_unavailability_periods (doctor_id, start_date, end_date);

ALTER TABLE public.doctor_unavailability_periods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors can view own unavailability periods" ON public.doctor_unavailability_periods;
CREATE POLICY "Doctors can view own unavailability periods"
ON public.doctor_unavailability_periods
FOR SELECT
TO authenticated
USING (auth.uid() = doctor_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Doctors can insert own unavailability periods" ON public.doctor_unavailability_periods;
CREATE POLICY "Doctors can insert own unavailability periods"
ON public.doctor_unavailability_periods
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = doctor_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Doctors can update own unavailability periods" ON public.doctor_unavailability_periods;
CREATE POLICY "Doctors can update own unavailability periods"
ON public.doctor_unavailability_periods
FOR UPDATE
TO authenticated
USING (auth.uid() = doctor_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = doctor_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Doctors can delete own unavailability periods" ON public.doctor_unavailability_periods;
CREATE POLICY "Doctors can delete own unavailability periods"
ON public.doctor_unavailability_periods
FOR DELETE
TO authenticated
USING (auth.uid() = doctor_id OR public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_doctor_unavailability_periods_updated_at ON public.doctor_unavailability_periods;
CREATE TRIGGER trg_doctor_unavailability_periods_updated_at
BEFORE UPDATE ON public.doctor_unavailability_periods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();