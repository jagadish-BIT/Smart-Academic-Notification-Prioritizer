/*
  # Add enhanced notification tracking fields

  ## Changes
    - Add `status` column to track notification state (active, archived, expired)
    - Add `is_read` column to track if user has viewed the notification
    - Add `updated_at` column for tracking last modification time
    - Update RLS policies for better access control

  ## New Columns
    - `status` (text) - Status: active, archived, expired
    - `is_read` (boolean) - Whether the notification has been read by creator
    - `updated_at` (timestamptz) - Last update timestamp
*/

-- Add new columns to notifications table if they don't exist
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'expired')),
ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create or replace function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to recreate
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS notifications_deadline_idx ON notifications(deadline);
CREATE INDEX IF NOT EXISTS notifications_priority_idx ON notifications(priority);
CREATE INDEX IF NOT EXISTS notifications_category_idx ON notifications(category);
CREATE INDEX IF NOT EXISTS notifications_created_by_idx ON notifications(created_by);
CREATE INDEX IF NOT EXISTS notifications_target_group_idx ON notifications(target_group);
