-- ============================================
-- VERIFICAR E CORRIGIR ESTRUTURA DA TABELA PROCESSES
-- ============================================

-- Verificar colunas existentes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'processes'
ORDER BY ordinal_position;

-- Se alguma coluna não existir, adicione-as novamente
DO $$
BEGIN
    -- Verificar e adicionar polo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processes' AND column_name='polo') THEN
        ALTER TABLE public.processes ADD COLUMN polo TEXT DEFAULT 'ativo';
        RAISE NOTICE 'Coluna polo adicionada.';
    END IF;

    -- Verificar e adicionar valor_causa
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processes' AND column_name='valor_causa') THEN
        ALTER TABLE public.processes ADD COLUMN valor_causa DECIMAL(15,2);
        RAISE NOTICE 'Coluna valor_causa adicionada.';
    END IF;

    -- Verificar e adicionar percentual_honorario
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processes' AND column_name='percentual_honorario') THEN
        ALTER TABLE public.processes ADD COLUMN percentual_honorario DECIMAL(5,2);
        RAISE NOTICE 'Coluna percentual_honorario adicionada.';
    END IF;

    -- Verificar e adicionar honorario_calculado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processes' AND column_name='honorario_calculado') THEN
        ALTER TABLE public.processes ADD COLUMN honorario_calculado DECIMAL(15,2);
        RAISE NOTICE 'Coluna honorario_calculado adicionada.';
    END IF;

    -- Verificar e adicionar status_ganho
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processes' AND column_name='status_ganho') THEN
        ALTER TABLE public.processes ADD COLUMN status_ganho TEXT DEFAULT 'em_andamento';
        RAISE NOTICE 'Coluna status_ganho adicionada.';
    END IF;
END $$;

SELECT 'Verificação concluída!' as status;












