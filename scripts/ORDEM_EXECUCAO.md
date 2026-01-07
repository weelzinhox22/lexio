# 📋 Ordem de Execução dos Scripts SQL

## ⚠️ IMPORTANTE: Execute os scripts nesta ordem exata!

### 1️⃣ Script 001: `001_create_schema.sql`
**O que faz:**
- Cria todas as tabelas principais (profiles, clients, processes, deadlines, documents, etc.)
- Cria as tabelas `subscriptions` e `notifications`
- Habilita Row Level Security (RLS)
- Cria políticas RLS básicas
- Cria índices para performance

**Execute primeiro!** Este é o script base.

---

### 2️⃣ Script 002: `002_create_triggers.sql`
**O que faz:**
- Cria a função `update_updated_at_column()` para atualizar timestamps
- Cria triggers para atualizar `updated_at` em todas as tabelas
- Cria função `handle_new_user()` para criar profile automaticamente
- Cria trigger para criar profile quando usuário se registra
- Cria função para marcar prazos vencidos

**Execute segundo!** Depende das tabelas criadas no script 001.

---

### 3️⃣ Script 003: `003_create_subscriptions.sql`
**O que faz:**
- Verifica se as tabelas `subscriptions` e `profiles` existem
- Cria função `handle_new_user_subscription()` para criar subscription automaticamente
- Cria trigger para criar subscription quando profile é criado
- Cria subscriptions de trial para usuários existentes

**Execute terceiro!** Depende das tabelas criadas no script 001 e funções do script 002.

---

## ❌ NÃO execute o script 005

O script `005_criar_subscriptions_completo.sql` é uma versão alternativa/antiga. 
**Use apenas o script 003** que é mais atualizado e seguro.

---

## ✅ Verificação

Após executar os 3 scripts, verifique:

1. **No Supabase Dashboard → Table Editor**, você deve ver:
   - ✅ profiles
   - ✅ subscriptions
   - ✅ notifications
   - ✅ clients
   - ✅ processes
   - ✅ deadlines
   - ✅ documents
   - ✅ financial_transactions
   - ✅ leads
   - ✅ tasks
   - ✅ appointments
   - ✅ process_updates

2. **No SQL Editor**, execute para verificar:
   ```sql
   SELECT COUNT(*) FROM public.subscriptions;
   SELECT COUNT(*) FROM public.profiles;
   ```

3. **Teste criando um novo usuário** - uma subscription de trial deve ser criada automaticamente!

---

## 🐛 Problemas Comuns

### Erro: "relation 'subscriptions' does not exist"
**Solução:** Execute o script 001 primeiro! A tabela subscriptions é criada lá.

### Erro: "function update_updated_at_column() does not exist"
**Solução:** Execute o script 002 antes do 003.

### Erro: "relation 'profiles' does not exist"
**Solução:** Execute o script 001 primeiro!

---

## 📝 Resumo

```
1. 001_create_schema.sql     → Cria TODAS as tabelas
2. 002_create_triggers.sql   → Cria funções e triggers
3. 003_create_subscriptions.sql → Configura sistema de assinaturas
```

**Ordem: 001 → 002 → 003** ✅

