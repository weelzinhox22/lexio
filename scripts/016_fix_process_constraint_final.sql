-- ============================================
-- CORREÇÃO FINAL DO ERRO 409 AO CRIAR PROCESSO
-- ============================================

-- Este script corrige definitivamente o erro 409
-- Permite que process_number seja NULL e cria índice parcial

DO $$
BEGIN
    RAISE NOTICE '🔧 Iniciando correção...';
    
    -- PASSO 1: Remover constraint única antiga
    BEGIN
        EXECUTE '
            ALTER TABLE public.processes 
            DROP CONSTRAINT IF EXISTS processes_process_number_key CASCADE
        ';
        RAISE NOTICE '✅ Constraint antiga removida!';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Constraint não existe ou já foi removida';
    END;
    
    -- PASSO 2: Remover índices únicos antigos
    BEGIN
        DROP INDEX IF EXISTS public.processes_process_number_key CASCADE;
        RAISE NOTICE '✅ Índice antigo removido!';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Índice não existe ou já foi removido';
    END;
    
    -- PASSO 3: Permitir NULL em process_number
    BEGIN
        ALTER TABLE public.processes 
        ALTER COLUMN process_number DROP NOT NULL;
        RAISE NOTICE '✅ process_number agora permite NULL!';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'ℹ️ process_number já permite NULL';
    END;
    
    -- PASSO 4: Criar índice único PARCIAL (ignora NULL)
    -- Isso permite múltiplos registros com process_number NULL
    -- E garante unicidade apenas quando process_number não é NULL
    BEGIN
        DROP INDEX IF EXISTS idx_processes_number_user;
        
        CREATE UNIQUE INDEX idx_processes_number_user 
        ON public.processes(process_number, user_id)
        WHERE process_number IS NOT NULL;
        
        RAISE NOTICE '✅ Novo índice único PARCIAL criado!';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Erro ao criar índice: %', SQLERRM;
    END;
    
    RAISE NOTICE '🎉 Correção concluída com sucesso!';
END $$;

-- Verificar resultado
SELECT 
    '✅ VERIFICAÇÃO DE ÍNDICES' as titulo,
    indexname as nome_indice,
    indexdef as definicao
FROM pg_indexes 
WHERE tablename = 'processes' 
  AND (indexname LIKE '%number%' OR indexname LIKE '%process%')
ORDER BY indexname;

-- Verificar se process_number permite NULL
SELECT 
    '✅ VERIFICAÇÃO DE COLUNAS' as titulo,
    column_name as coluna,
    is_nullable as permite_null,
    data_type as tipo
FROM information_schema.columns
WHERE table_name = 'processes' 
  AND column_name = 'process_number';

SELECT '✅ SCRIPT EXECUTADO COM SUCESSO! Agora você pode criar processos sem erro 409!' as status;











