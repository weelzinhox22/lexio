-- ============================================
-- DEADLINE ALERT ENGINE - SCHEMA UPDATES (MVP)
-- ============================================
-- Adds:
-- - alert_status: active | urgent | overdue | done (engine-managed)
-- - acknowledged_at: "confirm awareness" timestamp
-- Notes:
-- - Does NOT calculate legal deadlines; assumes deadline_date already stored by user/system.
-- - UI must show disclaimer: "Alerta auxiliar — confira o prazo".

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='deadlines' AND column_name='alert_status'
  ) THEN
    ALTER TABLE public.deadlines
      ADD COLUMN alert_status TEXT NOT NULL DEFAULT 'active';
    RAISE NOTICE 'Coluna deadlines.alert_status adicionada.';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='deadlines' AND column_name='acknowledged_at'
  ) THEN
    ALTER TABLE public.deadlines
      ADD COLUMN acknowledged_at TIMESTAMPTZ;
    RAISE NOTICE 'Coluna deadlines.acknowledged_at adicionada.';
  END IF;
END $$;

-- Helpful index for banners/modals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'deadlines' AND indexname = 'idx_deadlines_alert_status'
  ) THEN
    CREATE INDEX idx_deadlines_alert_status
      ON public.deadlines(user_id, alert_status, deadline_date);
    RAISE NOTICE 'Índice idx_deadlines_alert_status criado.';
  END IF;
END $$;

SELECT 'Script 026_deadline_alert_engine.sql executado com sucesso!' as status;




