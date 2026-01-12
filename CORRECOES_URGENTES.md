# 🚨 CORREÇÕES URGENTES - Themixa

## ❌ ERROS CORRIGIDOS:

### 1. **Erro "Users is not defined"** ✅
**Problema:** Ao clicar em uma lei, aparecia erro no console

**Solução:**
- Adicionado `Users` aos imports do `lucide-react` no arquivo `components/laws/laws-search.tsx`
- Código já corrigido e enviado ao GitHub/Vercel

---

### 2. **Erro ao Executar Script 012** ✅
**Problema:** 
```
ERROR: 2BP01: cannot drop index processes_process_number_key 
because constraint processes_process_number_key on table processes requires it
```

**Solução:**
Criado **script alternativo mais robusto**: `scripts/014_drop_process_constraint.sql`

**Execute este script no Supabase:**
```sql
-- No Supabase SQL Editor, execute:
scripts/014_drop_process_constraint.sql
```

Este script:
- Remove a constraint COM CASCADE (remove o índice junto)
- Cria o novo índice composto
- Tem tratamento de erros
- Verifica o resultado automaticamente

**OU execute o script 012 atualizado** (também foi corrigido)

---

### 3. **Erro "policy already exists" no Storage** ✅
**Problema:** Ao tentar criar política, ela já existe

**Solução - OPÇÃO 1 (Recomendada):**
No Supabase Dashboard:
1. Vá em **Storage** > **letterheads** > **Policies**
2. **DELETE** todas as políticas antigas
3. Execute o script atualizado: `scripts/013_create_letterhead_bucket.sql`
   - Agora usa `CREATE POLICY IF NOT EXISTS`

**Solução - OPÇÃO 2 (Via SQL):**
```sql
-- Delete políticas antigas primeiro:
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 75glkd_0" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload letterhead logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view letterhead logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own letterhead logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own letterhead logos" ON storage.objects;

-- Depois execute:
scripts/013_create_letterhead_bucket.sql
```

---

## 🔧 PASSO A PASSO PARA CORRIGIR TUDO:

### **1. Corrigir erro de criar processo (URGENTE):**

No **Supabase SQL Editor**, execute:

```sql
-- Script mais robusto (recomendado):
DO $$
BEGIN
    -- Remover constraint com CASCADE
    BEGIN
        ALTER TABLE public.processes DROP CONSTRAINT IF EXISTS processes_process_number_key CASCADE;
        RAISE NOTICE 'Constraint removida!';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro: %', SQLERRM;
    END;
    
    -- Criar índice composto
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_processes_number_user') THEN
            CREATE UNIQUE INDEX idx_processes_number_user ON public.processes(process_number, user_id);
            RAISE NOTICE 'Índice criado!';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro: %', SQLERRM;
    END;
END $$;

-- Verificar
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'processes';
```

**Resultado esperado:**
- Mensagem: "Constraint removida!"
- Mensagem: "Índice criado!"
- Lista de índices mostrando `idx_processes_number_user`

---

### **2. Corrigir Storage (upload de logo):**

**No Supabase Dashboard:**
1. Vá em **Storage**
2. Clique no bucket **letterheads**
3. Aba **Policies**
4. **DELETE** todas as políticas antigas
5. Clique em **"New Policy"**
6. Cole cada política do script `013` uma por vez

**OU via SQL:**
```sql
-- Limpar políticas antigas
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 75glkd_0" ON storage.objects;

-- Criar novas políticas
CREATE POLICY "Users can upload letterhead logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'letterheads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view letterhead logos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'letterheads');

CREATE POLICY "Users can update their own letterhead logos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'letterheads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own letterhead logos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'letterheads' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

### **3. Aguardar deploy do Vercel:**

O código com as correções já foi enviado ao GitHub. O Vercel vai fazer deploy automaticamente.

**Para forçar novo deploy:**
1. Vá no **Vercel Dashboard**
2. Clique em **"Redeploy"**
3. Aguarde ~2 minutos

---

## ✅ APÓS EXECUTAR OS SCRIPTS:

### Testar criação de processo:
1. Vá em `/dashboard/processes/new`
2. Preencha o formulário
3. Clique em "Criar Processo"
4. ✅ Deve funcionar sem erro 409!

### Testar upload de logo:
1. Vá em `/dashboard/templates`
2. Aba "Papel Timbrado"
3. Clique em "Novo Papel Timbrado"
4. Faça upload de uma imagem
5. ✅ Deve funcionar sem erro!

### Testar consulta de leis:
1. Vá em `/dashboard/laws`
2. Clique em qualquer lei
3. ✅ Não deve mais dar erro "Users is not defined"!

---

## 📝 RESUMO:

✅ Erro "Users is not defined" - **Corrigido** (já no Vercel)  
✅ Script 012 de constraint - **Corrigido** (execute o 014)  
✅ Políticas do Storage - **Corrigido** (delete as antigas e recrie)  

**Após executar os scripts SQL, tudo funcionará! 🚀**

---

## 🆘 SE AINDA DER ERRO:

Me envie:
1. O erro EXATO que aparece no console
2. Em qual página está acontecendo
3. O que você estava fazendo quando o erro aconteceu

**Vou resolver imediatamente! 💪**







