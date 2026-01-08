-- ============================================
-- CRIAR TABELA DE TEMPLATES DE DOCUMENTOS
-- ============================================

-- Criar tabela de templates
CREATE TABLE IF NOT EXISTS public.document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL para templates do sistema
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- ex: 'direito_consumidor', 'direito_familia', 'trabalhista', etc
    subcategory TEXT, -- ex: 'peticao_inicial', 'contestacao', 'recurso'
    description TEXT,
    content TEXT NOT NULL, -- Conteúdo do template com placeholders
    placeholders JSONB, -- Array de placeholders disponíveis no template
    is_system BOOLEAN DEFAULT FALSE, -- Template do sistema ou customizado pelo usuário
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_document_templates_user_id ON public.document_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_category ON public.document_templates(category);
CREATE INDEX IF NOT EXISTS idx_document_templates_is_system ON public.document_templates(is_system);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_document_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_document_templates_updated_at ON public.document_templates;
CREATE TRIGGER trigger_update_document_templates_updated_at
    BEFORE UPDATE ON public.document_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_document_templates_updated_at();

-- Habilitar RLS
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Users can view their own templates and system templates" ON public.document_templates;
CREATE POLICY "Users can view their own templates and system templates"
    ON public.document_templates FOR SELECT
    USING (
        auth.uid() = user_id OR is_system = TRUE OR user_id IS NULL
    );

DROP POLICY IF EXISTS "Users can insert their own templates" ON public.document_templates;
CREATE POLICY "Users can insert their own templates"
    ON public.document_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own templates" ON public.document_templates;
CREATE POLICY "Users can update their own templates"
    ON public.document_templates FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own templates" ON public.document_templates;
CREATE POLICY "Users can delete their own templates"
    ON public.document_templates FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- CRIAR TABELA DE PAPEL TIMBRADO
-- ============================================

CREATE TABLE IF NOT EXISTS public.letterheads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo_url TEXT, -- URL do logo no Supabase Storage
    header_text TEXT, -- Texto do cabeçalho (nome do escritório, endereço, etc)
    footer_text TEXT, -- Texto do rodapé (OAB, contatos, etc)
    header_color TEXT DEFAULT '#000000',
    footer_color TEXT DEFAULT '#666666',
    font_family TEXT DEFAULT 'Arial',
    is_default BOOLEAN DEFAULT FALSE, -- Papel timbrado padrão
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_letterheads_user_id ON public.letterheads(user_id);
CREATE INDEX IF NOT EXISTS idx_letterheads_is_default ON public.letterheads(is_default);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_letterheads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_letterheads_updated_at ON public.letterheads;
CREATE TRIGGER trigger_update_letterheads_updated_at
    BEFORE UPDATE ON public.letterheads
    FOR EACH ROW
    EXECUTE FUNCTION update_letterheads_updated_at();

-- Habilitar RLS
ALTER TABLE public.letterheads ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Users can view their own letterheads" ON public.letterheads;
CREATE POLICY "Users can view their own letterheads"
    ON public.letterheads FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own letterheads" ON public.letterheads;
CREATE POLICY "Users can insert their own letterheads"
    ON public.letterheads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own letterheads" ON public.letterheads;
CREATE POLICY "Users can update their own letterheads"
    ON public.letterheads FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own letterheads" ON public.letterheads;
CREATE POLICY "Users can delete their own letterheads"
    ON public.letterheads FOR DELETE
    USING (auth.uid() = user_id);

SELECT 'Script 010_create_templates_table.sql executado com sucesso!' as status;

