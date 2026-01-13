-- ============================================
-- CRIAR TABELA DE LEIS FAVORITAS
-- ============================================

CREATE TABLE IF NOT EXISTS public.favorite_laws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    law_name TEXT NOT NULL,
    law_number TEXT NOT NULL,
    law_url TEXT NOT NULL,
    law_category TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_favorite_laws_user_id ON public.favorite_laws(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_laws_created_at ON public.favorite_laws(created_at DESC);

-- Índice único para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorite_laws_user_law 
ON public.favorite_laws(user_id, law_url);

-- Habilitar RLS
ALTER TABLE public.favorite_laws ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Users can view their own favorite laws" ON public.favorite_laws;
CREATE POLICY "Users can view their own favorite laws"
    ON public.favorite_laws FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own favorite laws" ON public.favorite_laws;
CREATE POLICY "Users can insert their own favorite laws"
    ON public.favorite_laws FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorite laws" ON public.favorite_laws;
CREATE POLICY "Users can delete their own favorite laws"
    ON public.favorite_laws FOR DELETE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own favorite laws" ON public.favorite_laws;
CREATE POLICY "Users can update their own favorite laws"
    ON public.favorite_laws FOR UPDATE
    USING (auth.uid() = user_id);

SELECT 'Tabela de leis favoritas criada com sucesso!' as status;










