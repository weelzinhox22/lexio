-- ============================================
-- ADD DEADLINE DETECTION FIELDS (MVP)
-- ============================================
-- Adds rule-based "possible deadline" detection fields to publications.
-- IMPORTANT:
-- - Does NOT calculate dates
-- - Stores only a signal + explicit day count when present

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='jusbrasil_publications' AND column_name='deadline_detected'
  ) THEN
    ALTER TABLE public.jusbrasil_publications
      ADD COLUMN deadline_detected BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE 'Coluna deadline_detected adicionada.';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='jusbrasil_publications' AND column_name='deadline_days'
  ) THEN
    ALTER TABLE public.jusbrasil_publications
      ADD COLUMN deadline_days INTEGER;
    RAISE NOTICE 'Coluna deadline_days adicionada.';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='jusbrasil_publications' AND column_name='confidence_score'
  ) THEN
    ALTER TABLE public.jusbrasil_publications
      ADD COLUMN confidence_score REAL;
    RAISE NOTICE 'Coluna confidence_score adicionada.';
  END IF;
END $$;

-- Optional index to query alerts fast
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'jusbrasil_publications' AND indexname = 'idx_jusbrasil_publications_deadline_detected'
  ) THEN
    CREATE INDEX idx_jusbrasil_publications_deadline_detected
      ON public.jusbrasil_publications(user_id, deadline_detected, publication_date);
    RAISE NOTICE 'Índice idx_jusbrasil_publications_deadline_detected criado.';
  END IF;
END $$;

SELECT 'Script 025_add_deadline_detection_to_publications.sql executado com sucesso!' as status;




