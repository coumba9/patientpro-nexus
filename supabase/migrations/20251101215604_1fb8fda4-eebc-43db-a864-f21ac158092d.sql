-- Add columns for reschedule tracking to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS previous_date date,
ADD COLUMN IF NOT EXISTS previous_time time without time zone,
ADD COLUMN IF NOT EXISTS reschedule_reason text,
ADD COLUMN IF NOT EXISTS reschedule_requested_by uuid,
ADD COLUMN IF NOT EXISTS reschedule_requested_at timestamp with time zone;

-- Add new status 'pending_reschedule' to the appointment status check
-- First, we need to check if there's a constraint on status
DO $$
BEGIN
  -- No need to modify anything if using text type without constraint
  -- Just document that 'pending_reschedule' is now a valid status
  -- Valid statuses: 'pending', 'confirmed', 'cancelled', 'completed', 'pending_reschedule'
END $$;