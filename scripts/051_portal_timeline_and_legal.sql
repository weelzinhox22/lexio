-- 051_portal_timeline_and_legal.sql
-- Adicionando Linha do Tempo para o Cliente e campos de resumo

-- 1. ADICIONANDO RESUMO SIMPLIFICADO NO PROCESSO
ALTER TABLE public.processes
ADD COLUMN IF NOT EXISTS client_summary TEXT;

-- 2. TABELA DE EVENTOS / LINHA DO TEMPO
CREATE TABLE IF NOT EXISTS public.process_timeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    process_id UUID REFERENCES public.processes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Advogado que criou
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_client_visible BOOLEAN DEFAULT true, -- Permite esconder notas internas
    category TEXT DEFAULT 'generic', -- communication, document, hearing, decision
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS para Timeline
ALTER TABLE public.process_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyers can manage timeline for their processes"
    ON public.process_timeline FOR ALL
    USING (auth.uid() = user_id);

-- Para o portal do cliente, a consulta será via Service Role no backend,
-- filtrando por process_id e is_client_visible = true.

-- 3. TABELA DE POLÍTICAS LEGAIS DO ESCRITÓRIO (Opcional, mas útil se o advogado quiser personalizar)
-- Por enquanto usaremos templates estáticos, mas deixamos a base pronta caso queira salvar no banco.
CREATE TABLE IF NOT EXISTS public.legal_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL, -- terms, privacy, lgpd
    content TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, doc_type)
);

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyers can manage their own legal documents"
    ON public.legal_documents FOR ALL
    USING (auth.uid() = user_id);
