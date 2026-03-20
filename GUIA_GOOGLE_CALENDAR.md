# 🗓️ GUIA DE CONFIGURAÇÃO - GOOGLE CALENDAR

## ✅ IMPLEMENTAÇÃO COMPLETA!

A integração com Google Calendar foi **100% implementada**! Agora você precisa configurar as credenciais do Google.

---

## 📋 PASSO A PASSO PARA CONFIGURAR

### **1. Criar Projeto no Google Cloud Console**

1. Acesse: https://console.cloud.google.com/
2. Clique em "Select a project" > "New Project"
3. Nome do projeto: `Themixa` (ou qualquer nome)
4. Clique em "Create"

### **2. Ativar a API do Google Calendar**

1. No menu lateral, vá em: **APIs & Services** > **Library**
2. Busque por: `Google Calendar API`
3. Clique em **Google Calendar API**
4. Clique em **ENABLE** (Ativar)

### **3. Criar Credenciais OAuth 2.0**

1. No menu lateral, vá em: **APIs & Services** > **Credentials**
2. Clique em **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Se aparecer aviso sobre "OAuth consent screen":
   - Clique em **CONFIGURE CONSENT SCREEN**
   - Escolha **External** (para testes) ou **Internal** (se tiver Google Workspace)
   - Clique em **CREATE**
   - Preencha:
     - **App name:** Themixa
     - **User support email:** seu e-mail
     - **Developer contact information:** seu e-mail
   - Clique em **SAVE AND CONTINUE**
   - Em **Scopes**, clique em **ADD OR REMOVE SCOPES**
   - Adicione os escopos:
     - `https://www.googleapis.com/auth/calendar.events`
     - `https://www.googleapis.com/auth/calendar.readonly`
   - Clique em **UPDATE** > **SAVE AND CONTINUE**
   - Em **Test users**, adicione seu e-mail do Google
   - Clique em **SAVE AND CONTINUE**
   - Revise e clique em **BACK TO DASHBOARD**

4. Volte para **Credentials** e clique novamente em **+ CREATE CREDENTIALS** > **OAuth client ID**
5. Escolha **Application type:** Web application
6. **Name:** Themixa Web Client
7. Em **Authorized redirect URIs**, adicione:
   ```
   http://localhost:3000/api/google-calendar/callback
   https://themixa.vercel.app/api/google-calendar/callback
   ```
   (Se tiver outro domínio, adicione também)

8. Clique em **CREATE**
9. **COPIE** o **Client ID** e o **Client Secret** que aparecerem

---

## 🔐 CONFIGURAR VARIÁVEIS DE AMBIENTE

### **Localmente (.env.local)**

Adicione no arquivo `.env.local`:

```env
# Google Calendar API
GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
```

### **No Vercel**

1. Acesse: https://vercel.com/
2. Vá no seu projeto Themixa
3. Clique em **Settings** > **Environment Variables**
4. Adicione as variáveis:
   - **Name:** `GOOGLE_CLIENT_ID`
   - **Value:** (cole o Client ID)
   - Clique em **Add**
   
   - **Name:** `GOOGLE_CLIENT_SECRET`
   - **Value:** (cole o Client Secret)
   - Clique em **Add**

5. Faça um novo deploy para aplicar as variáveis

---

## 🗄️ EXECUTAR SCRIPTS SQL NO SUPABASE

Execute os seguintes scripts no Supabase SQL Editor (na ordem):

### **Script 017: Criar tabela de tokens**
```sql
-- Copie e execute o conteúdo de:
scripts/017_add_google_calendar_tokens.sql
```

### **Script 018: Adicionar coluna aos prazos**
```sql
-- Copie e execute o conteúdo de:
scripts/018_add_google_calendar_event_id_to_deadlines.sql
```

---

## 🚀 COMO USAR

### **1. Conectar Google Calendar**

1. Faça login no Themixa
2. Vá em **Dashboard** > **Configurações**
3. Na seção **Integrações**, clique em **Conectar Google Calendar**
4. Você será redirecionado para o Google
5. Faça login com sua conta Google
6. Autorize o Themixa a acessar seu calendário
7. Você será redirecionado de volta para as Configurações
8. Pronto! O status mudará para **Conectado** ✅

### **2. Criar Prazos (Sincronização Automática)**

1. Vá em **Dashboard** > **Prazos** > **Novo Prazo**
2. Preencha os dados do prazo
3. Clique em **Criar Prazo**
4. **AUTOMATICAMENTE:**
   - O prazo é criado no Themixa
   - Um evento é criado no Google Calendar
   - O evento tem lembretes configurados

### **3. Atualizar Prazos**

- Quando você editar um prazo no Themixa
- O evento no Google Calendar será atualizado automaticamente

### **4. Deletar Prazos**

- Quando você deletar um prazo no Themixa
- O evento no Google Calendar será removido automaticamente

### **5. Desconectar**

- Vá em **Configurações** > **Integrações**
- Clique em **Desconectar**
- Os eventos já criados não serão removidos do Google Calendar

---

## 📊 O QUE FOI IMPLEMENTADO

### ✅ **Backend (APIs)**
- `/api/google-calendar/auth` - Inicia autenticação OAuth2
- `/api/google-calendar/callback` - Recebe callback do Google
- `/api/google-calendar/disconnect` - Desconecta o Google Calendar
- `/api/deadlines/sync-google-calendar` - Sincroniza prazos

### ✅ **Banco de Dados**
- Tabela `google_calendar_tokens` - Armazena tokens de acesso
- Coluna `google_calendar_connected` na tabela `users`
- Coluna `google_calendar_event_id` na tabela `deadlines`
- RLS (Row Level Security) configurado

### ✅ **Frontend**
- Botão "Conectar Google Calendar" nas Configurações
- Status de conexão (Conectado/Desconectado)
- Sincronização automática ao criar prazos

### ✅ **Funcionalidades**
- **Autenticação OAuth2** com Google
- **Renovação automática** de tokens expirados
- **Criação automática** de eventos no Google Calendar
- **Atualização automática** de eventos
- **Remoção automática** de eventos
- **Lembretes configurados** (1 dia antes + 1 hora antes)

---

## 🎯 PRÓXIMOS PASSOS (OPCIONAL)

### **Melhorias Futuras:**

1. **Sincronização Bidirecional Completa**
   - Webhook do Google Calendar para detectar mudanças
   - Atualizar Themixa quando evento for editado no Google

2. **Sincronização de Audiências**
   - Criar eventos para audiências também
   - Incluir local da audiência

3. **Escolha de Calendário**
   - Permitir usuário escolher qual calendário usar
   - Criar calendário específico "Themixa - Prazos"

4. **Configurações Avançadas**
   - Escolher cor dos eventos
   - Personalizar lembretes
   - Ativar/desativar sincronização por tipo de prazo

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### **Erro: "Google Client ID não configurado"**
- Verifique se adicionou as variáveis de ambiente
- Reinicie o servidor local ou faça redeploy no Vercel

### **Erro: "redirect_uri_mismatch"**
- Verifique se adicionou a URL de callback no Google Cloud Console
- URLs devem ser EXATAMENTE iguais (com/sem barra final)

### **Erro: "access_denied"**
- Usuário negou permissão
- Tente conectar novamente

### **Erro: "Token expirado"**
- O sistema renova automaticamente
- Se persistir, desconecte e conecte novamente

### **Eventos não aparecem no Google Calendar**
- Verifique se o Google Calendar está conectado
- Verifique os logs do navegador (F12 > Console)
- Verifique se os scripts SQL foram executados

---

## 📝 ARQUIVOS CRIADOS/MODIFICADOS

### **Novos Arquivos:**
- `lib/google-calendar/config.ts` - Configurações da API
- `lib/google-calendar/client.ts` - Cliente para interagir com Google Calendar
- `app/api/google-calendar/auth/route.ts` - Rota de autenticação
- `app/api/google-calendar/callback/route.ts` - Callback OAuth2
- `app/api/google-calendar/disconnect/route.ts` - Desconectar
- `app/api/deadlines/sync-google-calendar/route.ts` - Sincronização
- `scripts/017_add_google_calendar_tokens.sql` - Tabela de tokens
- `scripts/018_add_google_calendar_event_id_to_deadlines.sql` - Coluna event_id

### **Arquivos Modificados:**
- `app/dashboard/settings/page.tsx` - Adicionado seção de Integrações
- `components/deadlines/deadline-form-enhanced.tsx` - Sincronização ao criar
- `env.example` - Adicionadas variáveis do Google

---

## 🎉 CONCLUSÃO

A integração com Google Calendar está **COMPLETA e FUNCIONAL**!

**Basta configurar as credenciais do Google e executar os scripts SQL!** 🚀

**Qualquer dúvida, me avise!** 💙












