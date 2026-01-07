# 📱 Guia Completo de Configuração WhatsApp

Este guia detalha como configurar as notificações automáticas via WhatsApp no LegalFlow.

## 🎯 Visão Geral

O sistema envia notificações automáticas via WhatsApp para:
- ⏰ Prazos vencendo no dia (8h da manhã)
- 💳 Licenças expirando (9h da manhã)
- 📋 Atualizações de processos (futuro)

## 🔧 Opções de API WhatsApp

### Opção 1: Evolution API (RECOMENDADO - Gratuito)

**Vantagens:**
- ✅ Completamente gratuito
- ✅ Self-hosted (seu controle)
- ✅ Sem limites de mensagens
- ✅ Código aberto

**Requisitos:**
- VPS (DigitalOcean, AWS, Contabo, etc.)
- Docker instalado

**Instalação:**

1. **No seu VPS, instale o Docker:**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

2. **Rode a Evolution API:**
```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=sua-chave-segura-aqui \
  atendai/evolution-api
```

3. **Crie uma instância WhatsApp:**
```bash
curl -X POST http://seu-vps-ip:8080/instance/create \
  -H "apikey: sua-chave-segura-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "legalflow",
    "qrcode": true
  }'
```

4. **Conecte o WhatsApp:**
- Acesse `http://seu-vps-ip:8080/instance/connect/legalflow`
- Escaneie o QR Code com seu WhatsApp Business

5. **Configure as variáveis no Vercel:**
```env
WHATSAPP_API_URL=http://seu-vps-ip:8080/message/sendText/legalflow
WHATSAPP_API_KEY=sua-chave-segura-aqui
```

**Formato do Request:**
```typescript
{
  "number": "5511999999999",  // Com DDI + DDD
  "text": "Sua mensagem aqui"
}
```

---

### Opção 2: Z-API (Pago - Mais Simples)

**Vantagens:**
- ✅ Fácil configuração
- ✅ Sem precisar de VPS
- ✅ Dashboard web
- ✅ Suporte brasileiro

**Preços:** A partir de R$ 59/mês

**Configuração:**

1. **Acesse [z-api.io](https://z-api.io)**
2. **Crie uma conta e uma instância**
3. **Conecte seu WhatsApp Business**
4. **Pegue suas credenciais:**
   - Instância ID
   - Token

5. **Configure no Vercel:**
```env
WHATSAPP_API_URL=https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text
WHATSAPP_API_KEY=SEU_TOKEN
```

**Formato do Request:**
```typescript
{
  "phone": "5511999999999",  // Com DDI + DDD
  "message": "Sua mensagem aqui"
}
```

---

### Opção 3: Twilio (Pago - Empresarial)

**Vantagens:**
- ✅ Mais confiável
- ✅ SLA garantido
- ✅ Global
- ✅ Suporte 24/7

**Preços:** $0.005 por mensagem + número WhatsApp

**Configuração:**

1. **Acesse [twilio.com](https://www.twilio.com)**
2. **Crie uma conta**
3. **Ative WhatsApp Business API**
4. **Configure sandbox para testes**

5. **Configure no Vercel:**
```env
WHATSAPP_API_URL=https://api.twilio.com/2010-04-01/Accounts/ACCOUNT_SID/Messages.json
WHATSAPP_API_KEY=AUTH_TOKEN
```

**Formato do Request:**
```typescript
{
  "To": "whatsapp:+5511999999999",
  "From": "whatsapp:+14155238886",
  "Body": "Sua mensagem aqui"
}
```

---

## 🔒 Configuração de Segurança

### 1. Proteja a Rota Cron

No Vercel, adicione a variável:
```env
CRON_SECRET=gere_uma_string_aleatoria_muito_segura_aqui
```

**Gere um secret forte:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configure o Vercel Cron

O arquivo `vercel.json` já está configurado:
```json
{
  "crons": [
    {
      "path": "/api/cron/check-deadlines",
      "schedule": "0 8 * * *"
    }
  ]
}
```

### 3. Teste Manualmente

**Localmente (para testar a API):**
```bash
curl -X GET http://localhost:3000/api/cron/check-deadlines \
  -H "Authorization: Bearer seu-cron-secret"
```

**Em Produção:**
```bash
curl -X GET https://seu-app.vercel.app/api/cron/check-deadlines \
  -H "Authorization: Bearer seu-cron-secret"
```

---

## 📋 Formato das Mensagens

### Prazo Vencendo
```
🔔 *Prazo Vencendo Hoje!*

📋 *Prazo:* Contestação
⚖️ *Processo:* Ação Trabalhista (0001234-56.2024.5.02.0001)
📅 *Data:* 15/01/2025

📝 *Detalhes:* Apresentar contestação

Acesse o sistema para mais informações.
```

### Licença Expirada
```
⚠️ *Licença Expirada*

Olá Dr. João Silva,

Sua licença do sistema jurídico expirou.
Para continuar usando todas as funcionalidades, renove sua assinatura.

Acesse: https://seu-app.vercel.app/dashboard/subscription
```

---

## 🧪 Testando as Notificações

### 1. Adicione seu telefone no perfil
```sql
-- No Supabase SQL Editor
UPDATE profiles 
SET phone = '5511999999999' 
WHERE id = 'seu-user-id';
```

### 2. Crie um prazo para hoje
```sql
INSERT INTO deadlines (
  user_id, 
  title, 
  deadline_date, 
  status, 
  priority
) VALUES (
  'seu-user-id',
  'Teste de Notificação',
  CURRENT_DATE,
  'pending',
  'high'
);
```

### 3. Execute o cron manualmente
```bash
curl -X GET https://seu-app.vercel.app/api/cron/check-deadlines \
  -H "Authorization: Bearer seu-cron-secret"
```

### 4. Verifique a tabela de notificações
```sql
SELECT * FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🐛 Troubleshooting

### Mensagens não estão sendo enviadas

1. **Verifique as variáveis:**
```bash
# No Vercel Dashboard
Settings > Environment Variables
```

2. **Teste a API diretamente:**
```bash
curl -X POST $WHATSAPP_API_URL \
  -H "Authorization: Bearer $WHATSAPP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"phone": "5511999999999", "message": "Teste"}'
```

3. **Verifique os logs do Supabase:**
```sql
SELECT * FROM notifications 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

### Cron não está executando

1. **Verifique o Vercel Dashboard:**
   - Crons > Logs

2. **Certifique-se que o CRON_SECRET está correto**

3. **Formato do número está correto?**
   - Deve ser: `5511999999999` (DDI + DDD + Número)
   - Sem espaços, traços ou parênteses

---

## 💡 Dicas de Uso

1. **Teste em sandbox primeiro** antes de produção
2. **Use WhatsApp Business** para aparência profissional
3. **Configure horários adequados** (não envie à noite)
4. **Monitore a tabela de notificações** para erros
5. **Tenha um número backup** caso o principal falhe

---

## 📞 Suporte

Problemas com a integração?
- Evolution API: [GitHub](https://github.com/EvolutionAPI/evolution-api)
- Z-API: suporte@z-api.io
- Twilio: support@twilio.com
