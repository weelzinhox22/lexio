# 🔧 Configurar Bucket de Documentos no Supabase

## ❌ Erro Atual
```
StorageApiError: Bucket not found
```

O bucket `documents` não existe no Supabase Storage.

---

## ✅ Solução: Criar o Bucket

### Passo 1: Criar o Bucket pela Interface

1. Acesse o **Supabase Dashboard**
2. Vá em **Storage** (menu lateral)
3. Clique em **"Create a new bucket"**
4. Configure:
   - **Nome:** `documents`
   - **Public bucket:** ❌ **NÃO marque** (deixe desmarcado - documentos são privados)
   - **File size limit:** (opcional) 50 MB
   - **Allowed MIME types:** (opcional) Deixe vazio para aceitar todos
5. Clique em **"Create bucket"**

---

### Passo 2: Configurar Políticas de Acesso

Após criar o bucket, execute o script SQL:

1. Vá em **SQL Editor** no Supabase Dashboard
2. Clique em **"New Query"**
3. Cole o conteúdo do arquivo: `scripts/030_create_documents_bucket.sql`
4. Clique em **"Run"**

**OU** execute diretamente:

```sql
-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Política 1: Permitir upload (INSERT)
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política 2: Permitir leitura (SELECT)
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política 3: Permitir atualização (UPDATE)
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política 4: Permitir exclusão (DELETE)
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 🔒 Como Funciona a Segurança

As políticas garantem que:
- ✅ Cada usuário só pode fazer upload na sua própria pasta (`{user_id}/arquivo.pdf`)
- ✅ Cada usuário só pode ler seus próprios documentos
- ✅ Cada usuário só pode atualizar/deletar seus próprios documentos
- ✅ Documentos de outros usuários são inacessíveis

**Estrutura de pastas:**
```
documents/
  ├── {user_id_1}/
  │   ├── 1234567890-abc123.pdf
  │   └── 1234567891-def456.pdf
  ├── {user_id_2}/
  │   └── 1234567892-ghi789.pdf
  └── ...
```

---

## ✅ Verificar se Funcionou

1. Tente fazer upload de um documento em `/dashboard/documents/new`
2. Se funcionar, o bucket está configurado corretamente!
3. Se ainda der erro, verifique:
   - O bucket foi criado com o nome exato `documents` (sem espaços, minúsculas)
   - As políticas foram criadas (verifique em Storage > documents > Policies)
   - O usuário está autenticado

---

## 🐛 Troubleshooting

### Erro: "policy already exists"
```sql
-- Remover políticas antigas primeiro
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Depois execute o script novamente
```

### Erro: "bucket not found" mesmo após criar
- Verifique se o nome está exatamente `documents` (minúsculas, sem espaços)
- Verifique se você está no projeto correto do Supabase
- Tente recarregar a página do Storage

### Erro: "permission denied"
- Verifique se as políticas foram criadas corretamente
- Verifique se o usuário está autenticado
- Verifique se o formato do caminho está correto: `{user_id}/arquivo.pdf`

---

## 📝 Notas Importantes

- **Bucket é PRIVADO:** Não marque como público, pois documentos são sensíveis
- **Estrutura de pastas:** O código cria automaticamente `{user_id}/arquivo.pdf`
- **Tamanho máximo:** Configure um limite razoável (ex: 50 MB) para evitar abusos
- **MIME types:** Deixe vazio para aceitar todos os tipos de arquivo (PDF, DOCX, etc.)

---

## ✅ Checklist

- [ ] Bucket `documents` criado no Supabase Storage
- [ ] Bucket configurado como **PRIVADO** (não público)
- [ ] Políticas de acesso criadas via SQL
- [ ] Teste de upload funcionando
- [ ] Teste de download funcionando
- [ ] Teste de exclusão funcionando

---

**Pronto!** Após seguir estes passos, o erro deve ser resolvido. 🎉

