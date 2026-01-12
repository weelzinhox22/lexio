-- ============================================
-- NOTIFICATIONS - DEDUPE + SEVERITY (MVP)
-- ============================================
-- Adds:
-- - severity: info | warning | danger
-- - dedupe_key: used to prevent duplicate alerts (cooldown/one-shot rules)
-- - read_at: explicit read timestamp for in-app
-- - process_id: optional shortcut to show alert timeline inside a process view
-- - meta: JSONB for small structured details (days_remaining, rule, etc)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='notifications' AND column_name='severity'
  ) THEN
    ALTER TABLE public.notifications
      ADD COLUMN severity TEXT;
    RAISE NOTICE 'Coluna notifications.severity adicionada.';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='notifications' AND column_name='dedupe_key'
  ) THEN
    ALTER TABLE public.notifications
      ADD COLUMN dedupe_key TEXT;
    RAISE NOTICE 'Coluna notifications.dedupe_key adicionada.';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='notifications' AND column_name='read_at'
  ) THEN
    ALTER TABLE public.notifications
      ADD COLUMN read_at TIMESTAMPTZ;
    RAISE NOTICE 'Coluna notifications.read_at adicionada.';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='notifications' AND column_name='process_id'
  ) THEN
    ALTER TABLE public.notifications
      ADD COLUMN process_id UUID REFERENCES public.processes(id) ON DELETE SET NULL;
    RAISE NOTICE 'Coluna notifications.process_id adicionada.';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='notifications' AND column_name='meta'
  ) THEN
    ALTER TABLE public.notifications
      ADD COLUMN meta JSONB;
    RAISE NOTICE 'Coluna notifications.meta adicionada.';
  END IF;
END $$;

-- Unique index to prevent duplicates (per user + channel + dedupe_key)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'notifications' AND indexname = 'uniq_notifications_dedupe'
  ) THEN
    CREATE UNIQUE INDEX uniq_notifications_dedupe
      ON public.notifications(user_id, channel, dedupe_key)
      WHERE dedupe_key IS NOT NULL;
    RAISE NOTICE 'Índice uniq_notifications_dedupe criado.';
  END IF;
END $$;

-- Helpful index for process timeline
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'notifications' AND indexname = 'idx_notifications_process'
  ) THEN
    CREATE INDEX idx_notifications_process
      ON public.notifications(user_id, process_id, created_at DESC);
    RAISE NOTICE 'Índice idx_notifications_process criado.';
  END IF;
END $$;

SELECT 'Script 027_notifications_dedupe_and_severity.sql executado com sucesso!' as status;


