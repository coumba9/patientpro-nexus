-- Add is_active column to patients table for manual status management
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_patients_is_active ON public.patients(is_active);

-- Add comment to explain the column
COMMENT ON COLUMN public.patients.is_active IS 'Manual override for patient active status. True = active, False = inactive/archived';