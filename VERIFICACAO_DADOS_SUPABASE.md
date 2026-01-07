# 🔍 Verificação de Dados no Supabase

## ✅ Como Verificar se os Dados Estão Sendo Salvos

### 1. Execute o Script de Verificação

No Supabase SQL Editor, execute:

```sql
-- scripts/007_verify_data_saving.sql
```

Este script verifica:
- ✅ Contagem de registros em todas as tabelas
- ✅ Últimos registros criados (últimas 24h)
- ✅ Status do RLS (Row Level Security)
- ✅ Políticas de segurança
- ✅ Integridade de foreign keys
- ✅ Status das subscriptions
- ✅ Dados órfãos (sem user_id válido)

---

## 📊 Verificações Manuais

### 1. Verificar Clientes

```sql
SELECT 
  id, 
  name, 
  email, 
  phone, 
  created_at,
  user_id
FROM public.clients
ORDER BY created_at DESC
LIMIT 10;
```

### 2. Verificar Processos

```sql
SELECT 
  id,
  title,
  process_number,
  status,
  created_at,
  user_id
FROM public.processes
ORDER BY created_at DESC
LIMIT 10;
```

### 3. Verificar Prazos

```sql
SELECT 
  id,
  title,
  deadline_date,
  status,
  priority,
  created_at,
  user_id
FROM public.deadlines
ORDER BY created_at DESC
LIMIT 10;
```

### 4. Verificar Documentos

```sql
SELECT 
  id,
  title,
  file_name,
  file_size,
  created_at,
  user_id
FROM public.documents
ORDER BY created_at DESC
LIMIT 10;
```

### 5. Verificar Transações Financeiras

```sql
SELECT 
  id,
  title,
  amount,
  type,
  status,
  currency,
  created_at,
  user_id
FROM public.financial_transactions
ORDER BY created_at DESC
LIMIT 10;
```

### 6. Verificar Leads

```sql
SELECT 
  id,
  name,
  email,
  status,
  created_at,
  user_id
FROM public.leads
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🔒 Verificar RLS (Row Level Security)

### Verificar se RLS está ativo:

```sql
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'clients', 'processes', 'deadlines', 
    'documents', 'financial_transactions', 'leads'
  );
```

**Todos devem retornar `true` (RLS ativo)**

### Verificar políticas RLS:

```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 🐛 Problemas Comuns

### 1. Dados não aparecem

**Causa:** RLS bloqueando acesso

**Solução:**
```sql
-- Verificar se as políticas estão corretas
SELECT * FROM pg_policies 
WHERE tablename = 'clients';
```

### 2. Erro ao inserir dados

**Causa:** Foreign key inválida ou campo obrigatório faltando

**Solução:**
```sql
-- Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'clients'
ORDER BY ordinal_position;
```

### 3. Dados aparecem para outros usuários

**Causa:** RLS não configurado corretamente

**Solução:**
```sql
-- Verificar políticas
SELECT * FROM pg_policies 
WHERE tablename = 'clients' 
AND policyname LIKE '%own%';
```

---

## ✅ Checklist de Verificação

- [ ] Todas as tabelas existem
- [ ] RLS está ativo em todas as tabelas
- [ ] Políticas RLS estão criadas
- [ ] Dados estão sendo inseridos com `user_id` correto
- [ ] Foreign keys estão funcionando
- [ ] Não há dados órfãos
- [ ] Subscriptions estão sendo criadas automaticamente

---

## 🔍 Teste Rápido

Execute este teste para verificar se tudo está funcionando:

```sql
-- 1. Pegar seu user_id
SELECT id, email FROM auth.users LIMIT 1;

-- 2. Verificar se você tem subscription
SELECT * FROM public.subscriptions 
WHERE user_id = 'seu-user-id-aqui';

-- 3. Verificar seus dados
SELECT COUNT(*) as meus_clientes 
FROM public.clients 
WHERE user_id = 'seu-user-id-aqui';

SELECT COUNT(*) as meus_processos 
FROM public.processes 
WHERE user_id = 'seu-user-id-aqui';
```

---

## 📝 Logs de Debug

Se os dados não estão sendo salvos, verifique:

1. **Console do navegador** (F12) - erros JavaScript
2. **Network tab** - requisições para Supabase
3. **Supabase Logs** - Dashboard > Logs > API

---

## 🆘 Ainda com Problemas?

1. Verifique se o `user_id` está sendo passado corretamente
2. Verifique se as políticas RLS permitem INSERT
3. Verifique se os campos obrigatórios estão preenchidos
4. Verifique se há erros no console do navegador

