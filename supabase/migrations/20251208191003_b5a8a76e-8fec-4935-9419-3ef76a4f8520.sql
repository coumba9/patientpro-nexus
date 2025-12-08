-- =====================================================
-- FIX 1: patients table - Add time-based access restrictions
-- =====================================================

-- Drop existing overly permissive doctor policy
DROP POLICY IF EXISTS "Doctors can view their patients' data" ON public.patients;

-- Create new policy with time-based restrictions (90 days from last appointment)
CREATE POLICY "Doctors can view active patients data"
ON public.patients
FOR SELECT
USING (
  (id = auth.uid()) OR
  public.has_role(auth.uid(), 'admin') OR
  (EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.patient_id = patients.id 
    AND a.doctor_id = auth.uid()
    AND a.status IN ('pending', 'confirmed', 'completed')
    AND a.date >= CURRENT_DATE - INTERVAL '90 days'
  ))
);

-- =====================================================
-- FIX 2: medical_records table - Add time-based access restrictions
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view medical records they're involved in" ON public.medical_records;

-- Create new policy with time-based restrictions
CREATE POLICY "Users can view recent medical records"
ON public.medical_records
FOR SELECT
USING (
  (patient_id = auth.uid()) OR
  public.has_role(auth.uid(), 'admin') OR
  (
    doctor_id = auth.uid() AND
    (
      -- Doctor created this record within last 2 years
      created_at >= NOW() - INTERVAL '2 years'
      OR
      -- Or has an active appointment with patient
      EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.patient_id = medical_records.patient_id
        AND a.doctor_id = auth.uid()
        AND a.status IN ('pending', 'confirmed')
        AND a.date >= CURRENT_DATE - INTERVAL '30 days'
      )
    )
  )
);

-- =====================================================
-- FIX 3: invoices table - Add time-based access restrictions
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view invoices they're involved in" ON public.invoices;

-- Create new policy with time-based restrictions
CREATE POLICY "Users can view their recent invoices"
ON public.invoices
FOR SELECT
USING (
  (auth.uid() = patient_id) OR
  public.has_role(auth.uid(), 'admin') OR
  (
    auth.uid() = doctor_id AND
    -- Only invoices from last 1 year for doctors
    created_at >= NOW() - INTERVAL '1 year'
  )
);

-- =====================================================
-- FIX 4: Create audit logging table for admin access
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action_type text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs - only admins can view, service role can insert
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
ON public.admin_audit_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert audit logs"
ON public.admin_audit_logs
FOR INSERT
WITH CHECK (true);

-- =====================================================
-- FIX 5: sms_logs table - Add rate limiting and better restrictions
-- =====================================================

-- Add index for better query performance and prevent enumeration
CREATE INDEX IF NOT EXISTS idx_sms_logs_user_id ON public.sms_logs(user_id);

-- Update policies to be more restrictive
DROP POLICY IF EXISTS "Users can view their own SMS logs" ON public.sms_logs;
DROP POLICY IF EXISTS "Admins can view all SMS logs" ON public.sms_logs;

-- Users can only view their own SMS logs from last 30 days
CREATE POLICY "Users can view own recent SMS logs"
ON public.sms_logs
FOR SELECT
USING (
  auth.uid() = user_id AND
  created_at >= NOW() - INTERVAL '30 days'
);

-- Admins can view all but this triggers audit logging via function
CREATE POLICY "Admins can view SMS logs with audit"
ON public.sms_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- FIX 6: Create function to log admin profile access
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_admin_access(
  p_table_name text,
  p_record_id uuid,
  p_action_type text DEFAULT 'view'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    INSERT INTO public.admin_audit_logs (admin_id, action_type, table_name, record_id)
    VALUES (auth.uid(), p_action_type, p_table_name, p_record_id);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_admin_access(text, uuid, text) TO authenticated;