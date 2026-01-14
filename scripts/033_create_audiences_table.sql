-- ============================================
-- CRIAR TABELA DE AUDIÊNCIAS
-- ============================================

CREATE TABLE IF NOT EXISTS public.audiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  process_id UUID REFERENCES public.processes(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  audience_date TIMESTAMPTZ NOT NULL,
  audience_type TEXT, -- instrucao, conciliacao, julgamento, etc
  location TEXT, -- local físico ou virtual
  location_type TEXT DEFAULT 'presencial', -- presencial, virtual, hibrido
  meeting_link TEXT, -- link para audiência virtual
  status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled, postponed
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audiences_user_id ON public.audiences(user_id);
CREATE INDEX IF NOT EXISTS idx_audiences_process_id ON public.audiences(process_id);
CREATE INDEX IF NOT EXISTS idx_audiences_audience_date ON public.audiences(audience_date);
CREATE INDEX IF NOT EXISTS idx_audiences_status ON public.audiences(status);

-- RLS Policies
ALTER TABLE public.audiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audiences_select_own" ON public.audiences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "audiences_insert_own" ON public.audiences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "audiences_update_own" ON public.audiences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "audiences_delete_own" ON public.audiences
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_audiences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audiences_updated_at
  BEFORE UPDATE ON public.audiences
  FOR EACH ROW
  EXECUTE FUNCTION update_audiences_updated_at();

SELECT 'Tabela de audiências criada com sucesso!' as status;



