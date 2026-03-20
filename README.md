# Themixa - Sistema de Gestão Jurídica

SaaS completo e escalável para gestão de escritórios jurídicos, desenvolvido com Next.js 16, Supabase e TypeScript.

> **Themixa** - Inspirado em Themis, a deusa da Justiça. A solução completa para gestão jurídica moderna.

## 🚀 Funcionalidades

### ✅ Gestão de Processos
- Cadastro completo de processos judiciais
- Controle de status, prioridade e etapas
- Vinculação com clientes e documentos
- Timeline de atualizações

### ✅ Gestão de Clientes & CRM
- Cadastro de clientes (PF e PJ)
- Pipeline de leads com conversão
- Histórico completo de interações
- Score e origem de leads

### ✅ Controle de Prazos
- Calendário visual de prazos
- Alertas automáticos via WhatsApp
- Categorização por prioridade
- Integração com processos

### ✅ Gestão Financeira
- Controle de receitas e despesas
- Honorários e custas processuais
- Relatórios financeiros
- Controle de inadimplência

### ✅ Documentos
- Upload e organização de documentos
- Categorização automática
- Busca e filtros avançados
- Vinculação com processos

### ✅ Sistema de Licenças
- Controle de assinaturas (trial, básico, premium, enterprise)
- Bloqueio automático ao expirar
- Notificações de renovação
- Integração com Stripe (preparado)

### ✅ Notificações WhatsApp
- Alertas automáticos de prazos
- Lembretes de pagamento
- Atualizações de processos
- Cron jobs diários

### ✅ Relatórios & Analytics
- Dashboard com KPIs
- Relatórios financeiros
- Análise de processos
- Métricas de performance

## 🛠️ Stack Tecnológica

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Backend:** Next.js API Routes, Server Actions
- **Banco de Dados:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **UI:** Tailwind CSS 4, shadcn/ui
- **Notificações:** WhatsApp API (Evolution API / Z-API / Twilio)
- **Deploy:** Vercel
- **Pagamentos:** Stripe (preparado)

## 📋 Pré-requisitos

- Node.js 18+
- Conta Vercel
- Conta Supabase
- API de WhatsApp (opcional para notificações)

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd legal-flow
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente

**⚠️ IMPORTANTE:** Você precisa configurar as variáveis de ambiente antes de rodar o projeto!

#### Para desenvolvimento local:

1. Crie um arquivo `.env.local` na raiz do projeto
2. Copie o conteúdo do arquivo `env.example`:
   ```bash
   # Windows (PowerShell)
   Copy-Item env.example .env.local
   
   # Linux/Mac
   cp env.example .env.local
   ```
3. Obtenha suas credenciais do Supabase:
   - Acesse: https://supabase.com/dashboard/project/_/settings/api
   - Copie a **Project URL** e as chaves **anon public** e **service_role**
4. Edite o `.env.local` e preencha com suas credenciais:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-public
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
   WHATSAPP_API_URL=
   WHATSAPP_API_KEY=
   CRON_SECRET=gere-uma-string-aleatoria-segura
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

📖 **Guia completo:** Veja [CONFIGURACAO_ENV.md](./CONFIGURACAO_ENV.md) para instruções detalhadas.

#### Para produção (Vercel):

Adicione as seguintes variáveis no painel da Vercel (Settings > Environment Variables):

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-public
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
WHATSAPP_API_URL=https://sua-api-whatsapp.com/send
WHATSAPP_API_KEY=sua-chave-api
CRON_SECRET=gere-uma-string-aleatoria-segura
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

### 4. Execute os scripts SQL

Entre no **SQL Editor** do Supabase e execute os scripts na ordem:

1. `scripts/001_create_schema.sql` - Cria tabelas principais
2. `scripts/002_create_triggers.sql` - Cria triggers e funções
3. `scripts/003_create_subscriptions.sql` - Cria sistema de licenças

**⚠️ IMPORTANTE:** Execute todos os scripts para ter o sistema completo funcionando.

### 5. Rode o projeto localmente
```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🔐 Sistema de Licenças

O sistema inclui controle automático de assinaturas:

- **Trial:** 7 dias grátis para novos usuários
- **Básico:** R$ 97/mês - até 50 processos
- **Premium:** R$ 197/mês - processos ilimitados + WhatsApp
- **Enterprise:** R$ 397/mês - recursos avançados

### Como funciona:
1. Novos usuários começam com 7 dias trial
2. Middleware verifica licença em TODAS as páginas do dashboard
3. Se expirado, redireciona para `/dashboard/subscription`
4. Cron job diário verifica e envia notificações

## 📱 Configuração WhatsApp

### Opção 1: Evolution API (Gratuita - Self-hosted)
```bash
# Rode em um VPS
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  atendai/evolution-api
```

Configure a variável:
```env
WHATSAPP_API_URL=http://seu-vps:8080/message/sendText/sua-instancia
WHATSAPP_API_KEY=sua-api-key
```

### Opção 2: Z-API (Paga - Mais fácil)
1. Acesse [z-api.io](https://z-api.io)
2. Crie uma instância
3. Configure:
```env
WHATSAPP_API_URL=https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text
WHATSAPP_API_KEY=SEU_TOKEN
```

### Opção 3: Twilio (Paga - Empresarial)
```env
WHATSAPP_API_URL=https://api.twilio.com/2010-04-01/Accounts/ACCOUNT_SID/Messages.json
WHATSAPP_API_KEY=SEU_AUTH_TOKEN
```

## ⏰ Cron Jobs (Vercel)

O arquivo `vercel.json` configura 2 cron jobs:

### 1. Verificação de Prazos (Diário às 8h)
- Endpoint: `/api/cron/check-deadlines`
- Verifica prazos do dia
- Envia WhatsApp para advogados

### 2. Verificação de Licenças (Diário às 9h)
- Endpoint: `/api/cron/check-subscriptions`
- Atualiza status de assinaturas expiradas
- Envia notificações de renovação

**⚠️ IMPORTANTE:** Os cron jobs requerem a variável `CRON_SECRET` para segurança.

## 🔒 Segurança

### Row Level Security (RLS)
Todas as tabelas possuem políticas RLS garantindo que:
- Usuários só veem seus próprios dados
- Impossível acessar dados de outros advogados
- Service Role Key apenas para cron jobs

### Service Role Key
⚠️ **NUNCA exponha a SUPABASE_SERVICE_ROLE_KEY no frontend**
- Use apenas em API Routes
- Necessária para cron jobs (ignorar RLS)
- Mantida segura nas variáveis de ambiente

### Middleware
- Verifica autenticação em todas as rotas `/dashboard`
- Verifica status da licença
- Redireciona usuários não autorizados

## 📊 Estrutura do Banco de Dados

```
profiles → Perfis de usuários (advogados)
subscriptions → Controle de licenças
clients → Clientes do escritório
processes → Processos judiciais
deadlines → Prazos e vencimentos
appointments → Agenda e compromissos
documents → Documentos e arquivos
financial_transactions → Movimentações financeiras
leads → Pipeline de vendas
tasks → Tarefas e pendências
notifications → Histórico de notificações
process_updates → Timeline de processos
```

## 🚀 Deploy na Vercel

1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

```bash
# Ou use a CLI
vercel --prod
```

## 📝 Uso do Sistema

### Primeiro Acesso
1. Acesse `/auth/sign-up`
2. Cadastre-se com email
3. Confirme o email
4. Você terá 7 dias de trial

### Cadastrar Clientes
1. Vá em **Clientes** → **Novo Cliente**
2. Preencha os dados
3. Cliente aparecerá na lista

### Criar Processos
1. Vá em **Processos** → **Novo Processo**
2. Vincule a um cliente
3. Adicione número do processo e detalhes

### Adicionar Prazos
1. Vá em **Prazos** → **Novo Prazo**
2. Vincule a um processo
3. Configure a data de vencimento
4. Sistema enviará WhatsApp automaticamente

## 🤝 Suporte

Para dúvidas ou problemas:
- Email: suporte@themixa.com.br
- WhatsApp: (11) 99999-9999

## 📄 Licença

Proprietary - Todos os direitos reservados
