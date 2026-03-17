
-- Create favorite_doctors table
CREATE TABLE public.favorite_doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (patient_id, doctor_id)
);

ALTER TABLE public.favorite_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_doctors FORCE ROW LEVEL SECURITY;

-- Patients can manage their own favorites
CREATE POLICY "Users can manage their own favorites"
  ON public.favorite_doctors FOR ALL
  TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Deny anonymous access
CREATE POLICY "Deny anonymous access to favorites"
  ON public.favorite_doctors FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- Admins can view all favorites
CREATE POLICY "Admins can view all favorites"
  ON public.favorite_doctors FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
