# 🔧 Solução Definitiva para o Erro SQL

## ❌ Erro que você está enfrentando:
```
Error: Failed to run sql query: ERROR: 42P01: relation "public.subscriptions" does not exist
```

## 🎯 Solução em 2 Passos

### OPÇÃO 1: Script Unificado (RECOMENDADO - Mais Fácil)

Execute APENAS este arquivo no Supabase SQL Editor:

**📁 `scripts/005_criar_subscriptions_completo.sql`**

Este script faz TUDO de uma vez:
- ✅ Cria a função `update_updated_at_column` (se não existir)
- ✅ Remove tudo relacionado a subscriptions (limpa)
- ✅ Cria as tabelas `subscriptions` e `notifications`
- ✅ Cria índices e políticas RLS
- ✅ Cria triggers
- ✅ Adiciona subscriptions para usuários existentes
- ✅ Verifica se funcionou

**Como executar:**

1. Acesse o Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Copie TODO o conteúdo de `scripts/005_criar_subscriptions_completo.sql`
6. Cole no editor
7. Clique em **Run** ou pressione `Ctrl+Enter`

✅ **Pronto!** Deve aparecer algo como:
```
✅ Subscriptions criadas: 1
✅ Profiles existentes: 1
✅ Sistema de assinaturas instalado com sucesso!
```

---

### OPÇÃO 2: Executar na Ordem (Se a Opção 1 falhar)

Se por algum motivo a Opção 1 não funcionar, execute na ordem:

1. **Primeiro:** `scripts/001_create_schema.sql`
2. **Depois:** `scripts/002_create_triggers.sql`
3. **Por último:** `scripts/005_criar_subscriptions_completo.sql`

---

## 🔍 Verificar se Funcionou

Execute esta query no Supabase SQL Editor:

```sql
-- Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'subscriptions'
) as tabela_existe;

-- Se retornar "true", funcionou! ✅
```

Ou simplesmente:

```sql
SELECT * FROM public.subscriptions LIMIT 5;
```

Se não der erro, funcionou! 🎉

---

## 🐛 Por que estava dando erro?

### Problema Identificado:
O script `003_create_subscriptions.sql` tinha 3 problemas:

1. **Dependência circular:** Tentava usar função antes de garantir que ela existia
2. **Nome de coluna:** Usava `subscription_status` em alguns lugares e `status` em outros
3. **Função UUID:** Usava `uuid_generate_v4()` que pode não estar disponível

### Solução Implementada:
O novo script `005_criar_subscriptions_completo.sql`:
- ✅ Cria a função `update_updated_at_column` primeiro
- ✅ Usa `status` consistentemente
- ✅ Usa `gen_random_uuid()` (nativo do PostgreSQL 13+)
- ✅ Remove tudo antes de criar (garante estado limpo)
- ✅ Verifica se funcionou no final

---

## 📋 Checklist Pós-Instalação

Depois que o script rodar com sucesso:

### 1. Verifique as tabelas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'notifications');
```

Deve retornar:
```
subscriptions
notifications
```

### 2. Verifique as políticas RLS
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('subscriptions', 'notifications');
```

Deve retornar 5 políticas.

### 3. Teste criar uma subscription
```sql
-- Pegue seu user_id
SELECT id, email FROM auth.users LIMIT 1;

-- Tente inserir (substitua o UUID)
INSERT INTO public.subscriptions (user_id, status)
VALUES ('seu-user-id-aqui', 'active')
ON CONFLICT (user_id) DO UPDATE SET status = 'active';
```

### 4. Descomente o middleware

Depois que tudo funcionar, descomente as linhas 43-73 em `lib/supabase/proxy.ts`:

```tsx
// Remova os /* */ ao redor do código:
if (user && request.nextUrl.pathname.startsWith("/dashboard")) {
  // ... código do middleware
}
```

---

## 🆘 Ainda Não Funcionou?

### Erro: "function uuid_generate_v4() does not exist"

Execute antes:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Ou use o script 005 que usa `gen_random_uuid()` (melhor).

### Erro: "function update_updated_at_column() does not exist"

O script 005 já cria essa função automaticamente. Execute ele completo.

### Erro: "relation 'profiles' does not exist"

Você precisa executar ANTES:
1. `scripts/001_create_schema.sql` (cria profiles)
2. `scripts/002_create_triggers.sql` (cria função)
3. `scripts/005_criar_subscriptions_completo.sql`

### Erro de permissão

Certifique-se de estar usando o usuário correto no Supabase (deve ser o owner do projeto).

---

## ✅ Confirmação Final

Quando tudo estiver funcionando, você verá:

1. ✅ Tabelas criadas (subscriptions, notifications)
2. ✅ Sem erros ao executar queries
3. ✅ Sistema não reclama mais de "relation does not exist"
4. ✅ Pode fazer login/cadastro normalmente

---

## 🎉 Próximo Passo

Depois que isso funcionar:
1. ✅ Configure `.env.local` (se ainda não fez)
2. ✅ Reinicie o servidor: `npm run dev`
3. ✅ Faça login/cadastro
4. ✅ Sistema funcionando!

---

*Qualquer dúvida, me chame! 🚀*


