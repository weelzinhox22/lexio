-- Add is_read to notifications table
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Create an index to improve querying unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
