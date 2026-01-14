-- ============================================
-- NOTIFICATIONS: DEADLINE EMAIL FIELDS + UNIQUE
-- ============================================
-- Ensures notifications table can track deadline email alerts and dedupe.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='notifications' AND column_name='deadline_id'
  ) THEN
    ALTER TABLE public.notifications
      ADD COLUMN deadline_id UUID REFERENCES public.deadlines(id) ON DELETE SET NULL;
    RAISE NOTICE 'Coluna notifications.deadline_id adicionada.';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='notifications' AND column_name='days_remaining'
  ) THEN
    ALTER TABLE public.notifications
      ADD COLUMN days_remaining INTEGER;
    RAISE NOTICE 'Coluna notifications.days_remaining adicionada.';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='notifications' AND column_name='acknowledged_at'
  ) THEN
    ALTER TABLE public.notifications
      ADD COLUMN acknowledged_at TIMESTAMPTZ;
    RAISE NOTICE 'Coluna notifications.acknowledged_at adicionada.';
  END IF;
END $$;

-- Unique constraint to prevent duplicate alerts per deadline/channel/days_remaining
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'notifications' AND indexname = 'uniq_deadline_channel_days'
  ) THEN
    CREATE UNIQUE INDEX uniq_deadline_channel_days
      ON public.notifications(deadline_id, channel, days_remaining)
      WHERE deadline_id IS NOT NULL AND days_remaining IS NOT NULL;
    RAISE NOTICE 'Índice uniq_deadline_channel_days criado.';
  END IF;
END $$;

SELECT 'Script 029_notifications_deadline_email_fields.sql executado com sucesso!' as status;





