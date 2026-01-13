-- ============================================
-- ADD MISSING FIELDS
-- Execute este script se já tiver criado as tabelas
-- ============================================

-- Adicionar file_path na tabela documents (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'file_path'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN file_path TEXT;
    END IF;
END $$;

-- Tornar file_url opcional (se ainda não for)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'file_url'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.documents ALTER COLUMN file_url DROP NOT NULL;
    END IF;
END $$;

-- Adicionar currency na tabela financial_transactions (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'financial_transactions' 
        AND column_name = 'currency'
    ) THEN
        ALTER TABLE public.financial_transactions ADD COLUMN currency TEXT DEFAULT 'BRL';
    END IF;
END $$;

-- Success!
SELECT 'Missing fields added successfully!' as result;










