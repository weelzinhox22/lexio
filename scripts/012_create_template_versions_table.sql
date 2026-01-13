-- ============================================
-- CRIAR TABELA DE VERSIONAMENTO DE TEMPLATES
-- ============================================

-- Criar tabela de versões de templates
CREATE TABLE IF NOT EXISTS public.document_template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.document_templates(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    placeholders JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Garantir que não haja duplicatas de version_number para o mesmo template
    UNIQUE(template_id, version_number)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_template_versions_template_id ON public.document_template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_created_at ON public.document_template_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_versions_version_number ON public.document_template_versions(template_id, version_number DESC);

-- Função para obter próxima versão
CREATE OR REPLACE FUNCTION get_next_template_version(template_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    next_version INTEGER;
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO next_version
    FROM public.document_template_versions
    WHERE template_id = template_uuid;
    
    RETURN next_version;
END;
$$ LANGUAGE plpgsql;

-- Habilitar RLS
ALTER TABLE public.document_template_versions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Usuários podem ver versões de templates que têm acesso
DROP POLICY IF EXISTS "Users can view template versions" ON public.document_template_versions;
CREATE POLICY "Users can view template versions"
    ON public.document_template_versions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.document_templates dt
            WHERE dt.id = document_template_versions.template_id
            AND (
                dt.user_id = auth.uid() 
                OR dt.is_system = TRUE 
                OR dt.user_id IS NULL
            )
        )
    );

-- Apenas o dono do template ou admin pode criar versões
DROP POLICY IF EXISTS "Users can create template versions" ON public.document_template_versions;
CREATE POLICY "Users can create template versions"
    ON public.document_template_versions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.document_templates dt
            WHERE dt.id = document_template_versions.template_id
            AND dt.user_id = auth.uid()
        )
    );

SELECT 'Script 012_create_template_versions_table.sql executado com sucesso!' as status;

