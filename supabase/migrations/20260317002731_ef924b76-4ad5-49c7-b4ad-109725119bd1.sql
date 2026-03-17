
-- Fix vaccinations: restrict doctor access to recent appointments only
DROP POLICY IF EXISTS "Users can view their own vaccinations" ON public.vaccinations;
DROP POLICY IF EXISTS "Doctors can manage vaccinations" ON public.vaccinations;

CREATE POLICY "Users can view their own vaccinations"
  ON public.vaccinations FOR SELECT
  USING (
    patient_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.appointments
      WHERE doctor_id = auth.uid()
      AND patient_id = vaccinations.patient_id
      AND status IN ('confirmed', 'completed')
      AND date >= CURRENT_DATE - INTERVAL '90 days'
    )
  );

CREATE POLICY "Doctors can manage vaccinations"
  ON public.vaccinations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE doctor_id = auth.uid()
      AND patient_id = vaccinations.patient_id
      AND status IN ('confirmed', 'completed')
      AND date >= CURRENT_DATE - INTERVAL '90 days'
    )
  );

-- Fix lab_results: restrict doctor access to recent appointments only
DROP POLICY IF EXISTS "Users can view their own lab results" ON public.lab_results;
DROP POLICY IF EXISTS "Doctors can manage lab results" ON public.lab_results;

CREATE POLICY "Users can view their own lab results"
  ON public.lab_results FOR SELECT
  USING (
    patient_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR (
      doctor_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.appointments
        WHERE doctor_id = auth.uid()
        AND patient_id = lab_results.patient_id
        AND status IN ('confirmed', 'completed')
        AND date >= CURRENT_DATE - INTERVAL '90 days'
      )
    )
  );

CREATE POLICY "Doctors can manage lab results"
  ON public.lab_results FOR ALL
  USING (
    doctor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.appointments
      WHERE doctor_id = auth.uid()
      AND patient_id = lab_results.patient_id
      AND status IN ('confirmed', 'completed')
      AND date >= CURRENT_DATE - INTERVAL '90 days'
    )
  );

-- Fix medical_images: restrict doctor access to recent appointments only
DROP POLICY IF EXISTS "Users can view their own medical images" ON public.medical_images;
DROP POLICY IF EXISTS "Doctors can manage medical images" ON public.medical_images;

CREATE POLICY "Users can view their own medical images"
  ON public.medical_images FOR SELECT
  USING (
    patient_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR (
      doctor_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.appointments
        WHERE doctor_id = auth.uid()
        AND patient_id = medical_images.patient_id
        AND status IN ('confirmed', 'completed')
        AND date >= CURRENT_DATE - INTERVAL '90 days'
      )
    )
  );

CREATE POLICY "Doctors can manage medical images"
  ON public.medical_images FOR ALL
  USING (
    doctor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.appointments
      WHERE doctor_id = auth.uid()
      AND patient_id = medical_images.patient_id
      AND status IN ('confirmed', 'completed')
      AND date >= CURRENT_DATE - INTERVAL '90 days'
    )
  );
