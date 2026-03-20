# 🚨 EXECUTE AGORA - ERRO 409 AINDA ACONTECENDO

## ⚠️ O ERRO 409 CONTINUA PORQUE VOCÊ NÃO EXECUTOU O SCRIPT SQL!

### 📋 COPIE E COLE ESTE CÓDIGO NO SUPABASE AGORA:

1. Vá em: https://supabase.com/dashboard/project/jjljpplzszeypsjxdsxy/sql
2. Clique em **"New Query"**
3. **COPIE TODO O CÓDIGO ABAIXO:**

```sql
-- ============================================
-- CORRIGIR ERRO 409 AO CRIAR PROCESSO
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Iniciando correção...';
    
    -- PASSO 1: Remover constraint antiga
    BEGIN
        ALTER TABLE public.processes DROP CONSTRAINT IF EXISTS processes_process_number_key CASCADE;
        RAISE NOTICE '✅ Constraint removida!';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Erro ao remover constraint: %', SQLERRM;
    END;
    
    -- PASSO 2: Criar novo índice composto
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_processes_number_user') THEN
            CREATE UNIQUE INDEX idx_processes_number_user ON public.processes(process_number, user_id);
            RAISE NOTICE '✅ Novo índice criado!';
        ELSE
            RAISE NOTICE 'ℹ️ Índice já existe.';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Erro ao criar índice: %', SQLERRM;
    END;
    
    RAISE NOTICE '🎉 Correção concluída!';
END $$;

-- Verificar resultado
SELECT 
    '✅ SUCESSO!' as status,
    indexname as indice_criado,
    indexdef as definicao
FROM pg_indexes 
WHERE tablename = 'processes' 
  AND indexname = 'idx_processes_number_user';
```

4. Clique em **"RUN"** (botão verde no canto inferior direito)

### 🎯 RESULTADO ESPERADO:

Você deve ver:
```
✅ Constraint removida!
✅ Novo índice criado!
🎉 Correção concluída!

status: ✅ SUCESSO!
indice_criado: idx_processes_number_user
```

---

## ✅ DEPOIS DE EXECUTAR:

1. Volte ao site: https://themixa.vercel.app
2. Vá em **Dashboard** > **Processos** > **Novo Processo**
3. Preencha o formulário
4. Clique em **"Criar Processo"**
5. **✅ DEVE FUNCIONAR SEM ERRO 409!**

---

## 🆘 SE AINDA DER ERRO:

Me envie uma print do erro EXATO que aparece no Supabase ao executar o script acima.

---

## 📝 IMPORTANTE:

Este script:
- Remove a constraint que está causando o erro 409
- Cria um novo índice que permite múltiplos advogados terem processos com o mesmo número
- É seguro executar múltiplas vezes (tem verificações)

**EXECUTE AGORA! ⏰**












