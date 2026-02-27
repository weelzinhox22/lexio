-- Tabela de Sugestões dos Usuários
CREATE TABLE IF NOT EXISTS public.user_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category TEXT NOT NULL, -- ex: 'criminal', 'ui', 'feature'
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_suggestions ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Usuários podem ver suas próprias sugestões" ON public.user_suggestions;
CREATE POLICY "Usuários podem ver suas próprias sugestões" 
    ON public.user_suggestions FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar sugestões" ON public.user_suggestions;
CREATE POLICY "Usuários podem criar sugestões" 
    ON public.user_suggestions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins podem ver todas as sugestões" ON public.user_suggestions;
CREATE POLICY "Admins podem ver todas as sugestões" 
    ON public.user_suggestions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins podem atualizar status" ON public.user_suggestions;
CREATE POLICY "Admins podem atualizar status" 
    ON public.user_suggestions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
