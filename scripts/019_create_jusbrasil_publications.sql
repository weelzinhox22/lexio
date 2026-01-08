-- Tabela para armazenar publicações encontradas no Jusbrasil
CREATE TABLE IF NOT EXISTS public.jusbrasil_publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  process_number TEXT,
  process_title TEXT,
  publication_type TEXT, -- tipo de publicação (intimação, sentença, etc)
  publication_date DATE NOT NULL,
  diary_name TEXT, -- nome do diário oficial
  diary_date DATE, -- data do diário
  searched_name TEXT, -- nome pesquisado que encontrou a publicação
  content TEXT, -- conteúdo da publicação
  pje_url TEXT, -- URL do PJe para acesso direto ao processo
  status TEXT DEFAULT 'untreated', -- untreated, treated, discarded
  treated_at TIMESTAMPTZ,
  discarded_at TIMESTAMPTZ,
  treated_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, process_number, publication_date, diary_name)
);

-- Índices para performance
CREATE INDEX idx_jusbrasil_publications_user_id ON public.jusbrasil_publications(user_id);
CREATE INDEX idx_jusbrasil_publications_status ON public.jusbrasil_publications(status);
CREATE INDEX idx_jusbrasil_publications_date ON public.jusbrasil_publications(publication_date);
CREATE INDEX idx_jusbrasil_publications_process ON public.jusbrasil_publications(process_number);

-- Enable RLS
ALTER TABLE public.jusbrasil_publications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "jusbrasil_publications_select_own" ON public.jusbrasil_publications 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "jusbrasil_publications_insert_own" ON public.jusbrasil_publications 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "jusbrasil_publications_update_own" ON public.jusbrasil_publications 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "jusbrasil_publications_delete_own" ON public.jusbrasil_publications 
  FOR DELETE USING (auth.uid() = user_id);

-- Adicionar campo para controlar busca automática no perfil
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS oab_state TEXT,
ADD COLUMN IF NOT EXISTS jusbrasil_auto_search BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS jusbrasil_last_search_at TIMESTAMPTZ;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_jusbrasil_publications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jusbrasil_publications_updated_at
  BEFORE UPDATE ON public.jusbrasil_publications
  FOR EACH ROW
  EXECUTE FUNCTION update_jusbrasil_publications_updated_at();

