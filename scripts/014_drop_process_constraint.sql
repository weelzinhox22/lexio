-- ============================================
-- REMOVER CONSTRAINT UNIQUE DE PROCESS_NUMBER
-- ============================================

-- Script alternativo mais simples
-- Execute este se o script 012 não funcionar

DO $$
BEGIN
    -- Tentar remover a constraint diretamente com CASCADE
    BEGIN
        ALTER TABLE public.processes DROP CONSTRAINT IF EXISTS processes_process_number_key CASCADE;
        RAISE NOTICE 'Constraint removida com CASCADE.';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover constraint: %', SQLERRM;
    END;
    
    -- Criar novo índice composto único (process_number + user_id)
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_processes_number_user') THEN
            CREATE UNIQUE INDEX idx_processes_number_user ON public.processes(process_number, user_id);
            RAISE NOTICE 'Índice único composto criado com sucesso.';
        ELSE
            RAISE NOTICE 'Índice já existe.';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao criar índice: %', SQLERRM;
    END;
END $$;

-- Verificar resultado
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'processes' 
  AND (indexname LIKE '%process_number%' OR indexname LIKE '%number_user%');

SELECT 'Script executado! Verifique os índices acima.' as status;

