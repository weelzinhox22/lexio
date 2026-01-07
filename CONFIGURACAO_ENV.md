# 🔧 Configuração das Variáveis de Ambiente

## ⚠️ Erro: "Your project's URL and Key are required to create a Supabase client!"

Este erro ocorre quando as variáveis de ambiente do Supabase não estão configuradas.

## 📝 Passo a Passo para Resolver

### 1. Obtenha suas credenciais do Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto (ou crie um novo)
3. Vá em **Settings** → **API**
4. Você encontrará:
   - **Project URL** → Use como `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use como `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → Use como `SUPABASE_SERVICE_ROLE_KEY` (⚠️ mantenha secreta!)

### 2. Crie o arquivo `.env.local`

Na raiz do projeto, crie um arquivo chamado `.env.local` com o seguinte conteúdo:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-public-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui

# WhatsApp API (opcional)
WHATSAPP_API_URL=
WHATSAPP_API_KEY=

# Cron Secret (gere uma string aleatória)
CRON_SECRET=sua-string-aleatoria-segura

# URL do App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Substitua os valores

Substitua:
- `https://seu-projeto.supabase.co` pela sua **Project URL**
- `sua-chave-anon-public-aqui` pela sua **anon public** key
- `sua-chave-service-role-aqui` pela sua **service_role** key
- `sua-string-aleatoria-segura` por uma string aleatória (ex: `openssl rand -hex 32`)

### 4. Reinicie o servidor de desenvolvimento

Após criar o arquivo `.env.local`, reinicie o servidor:

```bash
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

## ✅ Verificação

Se tudo estiver correto, o erro não deve mais aparecer e você poderá acessar a aplicação normalmente.

## 📋 Arquivo de Exemplo

Um arquivo `env.example` está disponível na raiz do projeto como referência. Você pode copiá-lo:

```bash
# Windows (PowerShell)
Copy-Item env.example .env.local

# Linux/Mac
cp env.example .env.local
```

Depois, edite o `.env.local` e preencha com suas credenciais reais.

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- Nunca commite o arquivo `.env.local` no Git
- O arquivo já está no `.gitignore` para sua segurança
- Nunca exponha a `SUPABASE_SERVICE_ROLE_KEY` no frontend
- Use apenas em API Routes e Server Components


