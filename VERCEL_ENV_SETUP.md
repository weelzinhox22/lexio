# 🚀 Configurar Variáveis de Ambiente no Vercel

## ⚠️ Erro Atual
```
{"error":"Configuration error. Please check environment variables."}
```

Este erro ocorre porque as variáveis de ambiente do Supabase não estão configuradas no Vercel.

---

## 📝 Passo a Passo (5 minutos)

### 1. Acesse o Dashboard do Vercel
👉 https://vercel.com/dashboard

### 2. Selecione seu Projeto
- Clique no projeto **lexio** (ou o nome que você deu)

### 3. Vá em Settings
- No menu superior, clique em **Settings**

### 4. Clique em Environment Variables
- No menu lateral esquerdo, clique em **Environment Variables**

### 5. Adicione as Variáveis

Clique em **Add New** e adicione cada variável:

#### Variável 1:
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://hvpbouaonwolixgedjaf.supabase.co`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variável 2:
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2cGJvdWFvbndvbGl4Z2VkamFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1OTkzNDIsImV4cCI6MjA3OTE3NTM0Mn0.RlMMMVdj4CJH916sUu4d_gCgVZ3sEeriZ627ybanEsw`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### 6. Salve
- Clique em **Save** após adicionar cada variável

### 7. Faça um Novo Deploy
- Vá em **Deployments**
- Clique nos **3 pontinhos** (⋯) do último deploy
- Selecione **Redeploy**
- Ou simplesmente faça um novo commit/push que o Vercel faz deploy automático

---

## ✅ Verificação

Após configurar e fazer o redeploy:
1. Aguarde o build completar (2-3 minutos)
2. Acesse sua URL do Vercel
3. O erro deve desaparecer! 🎉

---

## 🔑 Se Você Tem Suas Próprias Credenciais

Se essas credenciais não são do seu projeto Supabase:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → Use como `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use como `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Cole no Vercel conforme o passo 5 acima

---

## 📸 Onde Encontrar no Vercel

```
Dashboard → Seu Projeto → Settings → Environment Variables
```

---

## ⚡ Dica Rápida

Após adicionar as variáveis, você **NÃO precisa** fazer nada mais. O Vercel vai:
- ✅ Detectar o novo commit automaticamente
- ✅ Fazer deploy com as novas variáveis
- ✅ Aplicar em todos os ambientes (Production, Preview, Development)

