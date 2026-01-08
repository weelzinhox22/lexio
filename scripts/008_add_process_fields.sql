-- ============================================
-- ADICIONAR CAMPOS AOS PROCESSOS
-- ============================================

-- Adicionar coluna polo (ativo/passivo) se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processes' AND column_name='polo') THEN
        ALTER TABLE public.processes ADD COLUMN polo TEXT DEFAULT 'ativo'; -- ativo ou passivo
        RAISE NOTICE 'Coluna polo adicionada à tabela processes.';
    ELSE
        RAISE NOTICE 'Coluna polo já existe na tabela processes.';
    END IF;
END $$;

-- Adicionar coluna valor_causa se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processes' AND column_name='valor_causa') THEN
        ALTER TABLE public.processes ADD COLUMN valor_causa DECIMAL(15,2);
        RAISE NOTICE 'Coluna valor_causa adicionada à tabela processes.';
    ELSE
        RAISE NOTICE 'Coluna valor_causa já existe na tabela processes.';
    END IF;
END $$;

-- Adicionar coluna percentual_honorario se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processes' AND column_name='percentual_honorario') THEN
        ALTER TABLE public.processes ADD COLUMN percentual_honorario DECIMAL(5,2); -- ex: 20.00 = 20%
        RAISE NOTICE 'Coluna percentual_honorario adicionada à tabela processes.';
    ELSE
        RAISE NOTICE 'Coluna percentual_honorario já existe na tabela processes.';
    END IF;
END $$;

-- Adicionar coluna honorario_calculado se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processes' AND column_name='honorario_calculado') THEN
        ALTER TABLE public.processes ADD COLUMN honorario_calculado DECIMAL(15,2);
        RAISE NOTICE 'Coluna honorario_calculado adicionada à tabela processes.';
    ELSE
        RAISE NOTICE 'Coluna honorario_calculado já existe na tabela processes.';
    END IF;
END $$;

-- Adicionar coluna status_ganho se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processes' AND column_name='status_ganho') THEN
        ALTER TABLE public.processes ADD COLUMN status_ganho TEXT DEFAULT 'em_andamento'; -- em_andamento, ganho, perdido
        RAISE NOTICE 'Coluna status_ganho adicionada à tabela processes.';
    ELSE
        RAISE NOTICE 'Coluna status_ganho já existe na tabela processes.';
    END IF;
END $$;

-- Atualizar status existente para incluir status_ganho
DO $$
BEGIN
    UPDATE public.processes 
    SET status_ganho = CASE 
        WHEN status = 'won' THEN 'ganho'
        WHEN status = 'lost' THEN 'perdido'
        ELSE 'em_andamento'
    END
    WHERE status_ganho IS NULL;
    RAISE NOTICE 'Status_ganho atualizado para processos existentes.';
END $$;

-- Adicionar índice para busca por polo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'processes' AND indexname = 'idx_processes_polo') THEN
        CREATE INDEX idx_processes_polo ON public.processes(polo);
        RAISE NOTICE 'Índice idx_processes_polo criado.';
    ELSE
        RAISE NOTICE 'Índice idx_processes_polo já existe.';
    END IF;
END $$;

-- Adicionar índice para busca por status_ganho
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'processes' AND indexname = 'idx_processes_status_ganho') THEN
        CREATE INDEX idx_processes_status_ganho ON public.processes(status_ganho);
        RAISE NOTICE 'Índice idx_processes_status_ganho criado.';
    ELSE
        RAISE NOTICE 'Índice idx_processes_status_ganho já existe.';
    END IF;
END $$;

-- Criar função para calcular honorário automaticamente
CREATE OR REPLACE FUNCTION calculate_honorario()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular honorário apenas se status_ganho = 'ganho' e ambos valor_causa e percentual_honorario existirem
    IF NEW.status_ganho = 'ganho' AND NEW.valor_causa IS NOT NULL AND NEW.percentual_honorario IS NOT NULL THEN
        NEW.honorario_calculado := NEW.valor_causa * (NEW.percentual_honorario / 100);
    ELSE
        NEW.honorario_calculado := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para calcular honorário automaticamente
DROP TRIGGER IF EXISTS trigger_calculate_honorario ON public.processes;
CREATE TRIGGER trigger_calculate_honorario
    BEFORE INSERT OR UPDATE ON public.processes
    FOR EACH ROW
    EXECUTE FUNCTION calculate_honorario();

DO $$
BEGIN
    RAISE NOTICE 'Trigger para cálculo automático de honorário criado.';
END $$;

SELECT 'Script 008_add_process_fields.sql executado com sucesso!' as status;

