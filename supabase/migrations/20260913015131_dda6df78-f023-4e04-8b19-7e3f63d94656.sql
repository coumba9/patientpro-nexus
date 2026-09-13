CREATE TABLE IF NOT EXISTS public.system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.system_settings TO anon;
GRANT SELECT ON public.system_settings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.system_settings TO authenticated;
GRANT ALL ON public.system_settings TO service_role;

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "system_settings_public_read" ON public.system_settings;
CREATE POLICY "system_settings_public_read"
ON public.system_settings FOR SELECT
USING (key IN ('maintenance_mode','registration_enabled'));

DROP POLICY IF EXISTS "system_settings_admin_read" ON public.system_settings;
CREATE POLICY "system_settings_admin_read"
ON public.system_settings FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "system_settings_admin_write" ON public.system_settings;
CREATE POLICY "system_settings_admin_write"
ON public.system_settings FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "system_settings_admin_update" ON public.system_settings;
CREATE POLICY "system_settings_admin_update"
ON public.system_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "system_settings_admin_delete" ON public.system_settings;
CREATE POLICY "system_settings_admin_delete"
ON public.system_settings FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON public.system_settings;
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.system_settings (key, value) VALUES
  ('email_notifications', 'false'::jsonb),
  ('push_notifications', 'false'::jsonb),
  ('two_factor', 'false'::jsonb),
  ('activity_log', 'true'::jsonb),
  ('maintenance_mode', 'false'::jsonb),
  ('registration_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;