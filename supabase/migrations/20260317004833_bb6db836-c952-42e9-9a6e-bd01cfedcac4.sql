
-- Fix 1: Drop overly permissive "Service role" policies that actually grant public access
-- The service_role bypasses RLS entirely and never needs explicit policies.

DROP POLICY IF EXISTS "Service role can manage reminders" ON public.reminders;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.admin_audit_logs;

-- Add deny policy for anonymous access to reminders
CREATE POLICY "Deny anonymous access to reminders"
  ON public.reminders FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
