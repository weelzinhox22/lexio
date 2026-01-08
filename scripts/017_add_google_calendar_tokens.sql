-- =====================================================
-- SCRIPT 017: ADICIONAR TOKENS DO GOOGLE CALENDAR
-- =====================================================
-- Este script cria uma tabela para armazenar os tokens
-- de acesso do Google Calendar para cada usuário
-- =====================================================

-- Criar tabela para tokens do Google Calendar
CREATE TABLE IF NOT EXISTS public.google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Um usuário só pode ter um token ativo
  UNIQUE(user_id)
);

-- Criar índice para busca rápida por user_id
CREATE INDEX IF NOT EXISTS idx_google_calendar_tokens_user_id 
  ON public.google_calendar_tokens(user_id);

-- Habilitar RLS
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Política: usuários só podem ver seus próprios tokens
CREATE POLICY "Users can view their own Google Calendar tokens"
  ON public.google_calendar_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: usuários podem inserir seus próprios tokens
CREATE POLICY "Users can insert their own Google Calendar tokens"
  ON public.google_calendar_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem atualizar seus próprios tokens
CREATE POLICY "Users can update their own Google Calendar tokens"
  ON public.google_calendar_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: usuários podem deletar seus próprios tokens
CREATE POLICY "Users can delete their own Google Calendar tokens"
  ON public.google_calendar_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_google_calendar_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_google_calendar_tokens_updated_at
  BEFORE UPDATE ON public.google_calendar_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_google_calendar_tokens_updated_at();

-- Adicionar coluna na tabela profiles para indicar se está conectado
-- (Supabase usa profiles ao invés de public.users)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS google_calendar_connected BOOLEAN DEFAULT FALSE;

-- Comentários
COMMENT ON TABLE public.google_calendar_tokens IS 'Armazena tokens de acesso do Google Calendar para cada usuário';
COMMENT ON COLUMN public.google_calendar_tokens.access_token IS 'Token de acesso temporário do Google OAuth';
COMMENT ON COLUMN public.google_calendar_tokens.refresh_token IS 'Token para renovar o access_token';
COMMENT ON COLUMN public.google_calendar_tokens.expires_at IS 'Data/hora de expiração do access_token';

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Tabela google_calendar_tokens criada com sucesso!';
  RAISE NOTICE '✅ RLS habilitado e políticas criadas!';
  RAISE NOTICE '✅ Coluna google_calendar_connected adicionada à tabela profiles!';
END $$;

