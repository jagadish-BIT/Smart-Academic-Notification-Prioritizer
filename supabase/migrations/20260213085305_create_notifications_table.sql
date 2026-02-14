/*
  # Smart Academic Notification Prioritizer - Database Schema

  ## New Tables
    - `notifications`
      - `id` (uuid, primary key) - Unique identifier for each notification
      - `title` (text) - Title of the notification
      - `description` (text) - Detailed description
      - `category` (text) - Category: Assignment, Exam, Placement, Event
      - `priority` (text) - Priority level: Low, Medium, High, Critical
      - `deadline` (timestamptz) - Deadline date and time
      - `target_group` (text) - Target audience: All, CSE, IT, Final Year
      - `source` (text) - Source of notification: manual or email
      - `created_at` (timestamptz) - Timestamp when notification was created
      - `created_by` (uuid) - User who created the notification
      - `email_metadata` (jsonb) - Additional metadata from email parsing

  ## Security
    - Enable RLS on `notifications` table
    - Add policy for authenticated users to read all notifications
    - Add policy for authenticated users to create notifications
    - Add policy for authenticated users to delete their own notifications
    - Add policy for service role to insert notifications from email webhook

  ## Notes
    - The source field helps distinguish between manually created and email-parsed notifications
    - email_metadata stores original email details when notification comes from email
    - All users can view notifications but only delete their own (or admin can delete all)
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('Assignment', 'Exam', 'Placement', 'Event')),
  priority text NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  deadline timestamptz NOT NULL,
  target_group text NOT NULL CHECK (target_group IN ('All', 'CSE', 'IT', 'Final Year')),
  source text DEFAULT 'manual' CHECK (source IN ('manual', 'email')),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email_metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view notifications
CREATE POLICY "Users can view all notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create notifications
CREATE POLICY "Users can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Policy: Service role can insert notifications from email webhook
CREATE POLICY "Service role can insert email notifications"
  ON notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_deadline ON notifications(deadline);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);