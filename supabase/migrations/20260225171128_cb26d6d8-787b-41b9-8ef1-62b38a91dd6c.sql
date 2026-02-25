
-- Allow any authenticated user to view ratings (needed for displaying doctor reviews on search)
CREATE POLICY "Authenticated users can view all ratings"
ON public.ratings
FOR SELECT
USING (auth.uid() IS NOT NULL);
