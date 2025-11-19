-- Ensure public specialties are visible to unauthenticated users (e.g., doctor registration)
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

-- Relax and clarify SELECT policy so everyone can see active specialties
DROP POLICY IF EXISTS "Anyone can view specialties" ON public.specialties;

CREATE POLICY "Anyone can view active specialties"
ON public.specialties
FOR SELECT
USING (status = 'active');
