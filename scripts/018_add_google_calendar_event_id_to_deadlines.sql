-- =====================================================
-- SCRIPT 018: ADICIONAR GOOGLE_CALENDAR_EVENT_ID
-- =====================================================
-- Este script adiciona uma coluna para armazenar o ID
-- do evento no Google Calendar para cada prazo
-- =====================================================

-- Adicionar coluna para armazenar o ID do evento no Google Calendar
ALTER TABLE public.deadlines 
  ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_deadlines_google_calendar_event_id 
  ON public.deadlines(google_calendar_event_id) 
  WHERE google_calendar_event_id IS NOT NULL;

-- Comentário
COMMENT ON COLUMN public.deadlines.google_calendar_event_id IS 'ID do evento correspondente no Google Calendar';

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Coluna google_calendar_event_id adicionada à tabela deadlines!';
  RAISE NOTICE '✅ Índice criado para busca rápida!';
END $$;











