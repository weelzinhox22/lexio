# 🔄 Atualização do Supabase - Novo Projeto

## ✅ Mudanças Realizadas

### 1. Variáveis de Ambiente Atualizadas

As credenciais do Supabase foram atualizadas no arquivo `.env.local`:

**Antes:**
- URL: `https://hvpbouaonwolixgedjaf.supabase.co`
- Anon Key: (chave antiga)

**Agora:**
- URL: `https://jjljpplzszeypsjxdsxy.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbGpwcGx6c3pleXBzanhkc3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3ODIyOTIsImV4cCI6MjA4MzM1ODI5Mn0.VuY1YVwLyqeyY4kKFc5UZbqbmDk5V1CXgSRWpSiyGiI`
- Project ID: `jjljpplzszeypsjxdsxy`

### 2. Referências "LegalFlow" Removidas

Substituídas por "Lexio" nos seguintes arquivos:
- ✅ `components/dashboard/header.tsx` - "Bem-vindo ao Lexio"
- ✅ `app/auth/check-email/page.tsx` - Título atualizado
- ✅ `README.md` - Email atualizado

### 3. Tratamento de Erros Melhorado

- ✅ `components/documents/document-form.tsx` - Mensagens de erro mais claras

---

## ⚠️ IMPORTANTE: Próximos Passos

### 1. Execute os Scripts SQL no Novo Projeto

Você precisa executar os scripts SQL no **novo projeto Supabase** para criar todas as tabelas:

1. Acesse: https://supabase.com/dashboard/project/jjljpplzszeypsjxdsxy
2. Vá em **SQL Editor**
3. Execute os scripts na ordem:

```sql
-- 1. Primeiro: scripts/001_create_schema.sql
-- 2. Segundo: scripts/002_create_triggers.sql
-- 3. Terceiro: scripts/003_create_subscriptions.sql
```

### 2. Configure a Service Role Key

No arquivo `.env.local`, você precisa adicionar a **Service Role Key** do novo projeto:

1. Acesse: https://supabase.com/dashboard/project/jjljpplzszeypsjxdsxy/settings/api
2. Copie a **service_role** key (⚠️ mantenha secreta!)
3. Adicione no `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
   ```

### 3. Configure no Vercel (Produção)

Se você já fez deploy no Vercel, atualize as variáveis de ambiente:

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Atualize:
   - `NEXT_PUBLIC_SUPABASE_URL` → `https://jjljpplzszeypsjxdsxy.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → (nova chave anon)
   - `SUPABASE_SERVICE_ROLE_KEY` → (nova service role key)
5. Faça um novo deploy

### 4. Reinicie o Servidor Local

Após atualizar o `.env.local`, reinicie o servidor:

```bash
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

---

## 🔍 Verificação

Após executar os scripts SQL, verifique se as tabelas foram criadas:

1. No Supabase Dashboard, vá em **Table Editor**
2. Você deve ver as seguintes tabelas:
   - ✅ profiles
   - ✅ subscriptions
   - ✅ clients
   - ✅ processes
   - ✅ deadlines
   - ✅ documents
   - ✅ financial_transactions
   - ✅ leads
   - ✅ tasks
   - ✅ notifications
   - ✅ process_updates

---

## ❌ Erro ao Adicionar Documentos

Se você ainda receber erro ao adicionar documentos, verifique:

1. ✅ A tabela `documents` existe no banco de dados?
2. ✅ Os scripts SQL foram executados corretamente?
3. ✅ As variáveis de ambiente estão corretas?
4. ✅ O servidor foi reiniciado após atualizar o `.env.local`?

Se o erro persistir, verifique o console do navegador (F12) para ver a mensagem de erro completa.

