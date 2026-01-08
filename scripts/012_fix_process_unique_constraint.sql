-- ============================================
-- CORRIGIR CONSTRAINT UNIQUE DE PROCESS_NUMBER
-- ============================================

-- O erro 409 acontece porque process_number pode ter uma constraint UNIQUE
-- Vamos remover se existir, pois o mesmo número pode ser usado por advogados diferentes

DO $$
BEGIN
    -- Remover constraint única PRIMEIRO (o índice será removido automaticamente)
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'processes_process_number_key' 
        AND table_name = 'processes'
    ) THEN
        ALTER TABLE public.processes DROP CONSTRAINT IF EXISTS processes_process_number_key CASCADE;
        RAISE NOTICE 'Constraint processes_process_number_key removida (índice removido automaticamente).';
    END IF;
    
    -- Remover índice único se ainda existir (caso não esteja vinculado a constraint)
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'processes_process_number_key') THEN
        DROP INDEX IF EXISTS public.processes_process_number_key CASCADE;
        RAISE NOTICE 'Índice único processes_process_number_key removido.';
    END IF;

    -- Criar índice composto único (process_number + user_id)
    -- Isso permite que advogados diferentes tenham processos com o mesmo número
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_processes_number_user') THEN
        CREATE UNIQUE INDEX idx_processes_number_user ON public.processes(process_number, user_id);
        RAISE NOTICE 'Índice único composto idx_processes_number_user criado.';
    ELSE
        RAISE NOTICE 'Índice idx_processes_number_user já existe.';
    END IF;
END $$;

SELECT 'Constraint de process_number corrigida!' as status;

