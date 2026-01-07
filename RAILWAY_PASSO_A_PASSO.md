# 🚂 Railway.app - Guia Passo a Passo Completo

## 🎯 O Que É Railway?

Railway é uma plataforma para deploy de aplicações com:
- ✅ **$5/mês grátis** (renova todo mês)
- ✅ Deploy com **1 clique**
- ✅ Sem necessidade de Docker manual
- ✅ HTTPS automático
- ✅ Logs em tempo real

**Perfeito para rodar a Evolution API (WhatsApp)!**

---

## 📋 Pré-requisitos

Você vai precisar de:
1. ✅ Conta no GitHub (gratuita)
2. ✅ Email para criar conta Railway
3. ✅ 10 minutos do seu tempo

**NÃO precisa:**
- ❌ VPS
- ❌ Docker instalado
- ❌ Conhecimento de terminal
- ❌ Cartão de crédito (para começar)

---

## 🚀 Passo 1: Criar Conta no Railway

### 1.1 Acesse o Site
👉 https://railway.app

### 1.2 Clique em "Login"
- No canto superior direito

### 1.3 Faça login com GitHub
- Clique em **"Login with GitHub"**
- Autorize o Railway (é seguro)

✅ **Pronto! Conta criada!**

Você ganha **$5 de crédito grátis** que renova todo mês.

---

## 🐳 Passo 2: Deploy da Evolution API

### Opção A: Deploy Rápido (RECOMENDADO)

#### 2.1 Clique neste link:
👉 https://railway.app/template/evolution-api

Ou procure por "Evolution API" no Railway Templates.

#### 2.2 Clique em "Deploy Now"

#### 2.3 Configure as variáveis:
- **AUTHENTICATION_API_KEY:** Crie uma senha forte
  - Exemplo: `lexio_api_2026_secure_key_12345`
  - ⚠️ Guarde essa senha! Você vai precisar depois

#### 2.4 Clique em "Deploy"

⏳ Aguarde 2-3 minutos...

✅ **Deploy concluído!**

---

### Opção B: Deploy Manual (Se a Opção A não funcionar)

#### 2.1 No Dashboard do Railway
- Clique em **"New Project"**

#### 2.2 Selecione "Deploy from Docker Hub"

#### 2.3 Digite a imagem:
```
atendai/evolution-api
```

#### 2.4 Clique em "Deploy"

#### 2.5 Configure as variáveis de ambiente:
- Vá em **"Variables"** (aba lateral)
- Adicione:
  ```
  AUTHENTICATION_API_KEY = lexio_api_2026_secure_key_12345
  PORT = 8080
  ```

#### 2.6 Salve e aguarde o deploy

---

## 🌐 Passo 3: Obter a URL da API

### 3.1 No Dashboard do Projeto
- Clique no seu projeto (Evolution API)

### 3.2 Vá em "Settings" → "Networking"

### 3.3 Clique em "Generate Domain"

⏳ Aguarde alguns segundos...

✅ **URL gerada!** Algo como:
```
https://evolution-api-production-xxxx.up.railway.app
```

📋 **Copie essa URL!** Você vai precisar dela.

---

## 📱 Passo 4: Conectar o WhatsApp

### 4.1 Criar Instância

Abra o terminal (PowerShell no Windows) ou use a ferramenta online:
👉 https://reqbin.com (se não quiser usar terminal)

Execute este comando (substitua os valores):

```bash
curl -X POST https://sua-url-railway.app/instance/create \
  -H "apikey: lexio_api_2026_secure_key_12345" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "lexio",
    "qrcode": true
  }'
```

**No PowerShell (Windows):**
```powershell
$headers = @{
    "apikey" = "lexio_api_2026_secure_key_12345"
    "Content-Type" = "application/json"
}

$body = @{
    instanceName = "lexio"
    qrcode = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://sua-url-railway.app/instance/create" -Method Post -Headers $headers -Body $body
```

✅ **Instância criada!**

---

### 4.2 Obter QR Code

**No navegador, acesse:**
```
https://sua-url-railway.app/instance/connect/lexio
```

Ou via terminal:
```bash
curl https://sua-url-railway.app/instance/connect/lexio \
  -H "apikey: lexio_api_2026_secure_key_12345"
```

📱 **Você verá um QR Code!**

---

### 4.3 Escanear QR Code

1. Abra o **WhatsApp** no celular
2. Vá em **Configurações** → **Aparelhos Conectados**
3. Clique em **"Conectar um aparelho"**
4. Escaneie o QR Code que apareceu

⏳ Aguarde alguns segundos...

✅ **WhatsApp conectado!**

---

## ⚙️ Passo 5: Configurar no Lexio

### 5.1 Abra o arquivo `.env.local` do seu projeto

```env
# WhatsApp API (Railway)
WHATSAPP_API_URL=https://sua-url-railway.app/message/sendText/lexio
WHATSAPP_API_KEY=lexio_api_2026_secure_key_12345

# Outras variáveis...
```

### 5.2 Substitua:
- `sua-url-railway.app` → Sua URL do Railway
- `lexio_api_2026_secure_key_12345` → Sua API key

### 5.3 Salve o arquivo

---

## ✅ Passo 6: Testar o Envio

### 6.1 Via Terminal (PowerShell):

```powershell
$headers = @{
    "apikey" = "lexio_api_2026_secure_key_12345"
    "Content-Type" = "application/json"
}

$body = @{
    number = "5511999999999"  # Seu número com DDI + DDD
    text = "🎉 Teste do Lexio! WhatsApp funcionando via Railway!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://sua-url-railway.app/message/sendText/lexio" -Method Post -Headers $headers -Body $body
```

### 6.2 Via Browser (Postman/Insomnia)

**POST:** `https://sua-url-railway.app/message/sendText/lexio`

**Headers:**
```
apikey: lexio_api_2026_secure_key_12345
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "number": "5511999999999",
  "text": "🎉 Teste do Lexio!"
}
```

📱 **Você deve receber a mensagem no WhatsApp!**

✅ **Funcionou? Parabéns! 🎉**

---

## 🔧 Passo 7: Deploy no Vercel

### 7.1 Acesse Vercel Dashboard
👉 https://vercel.com/dashboard

### 7.2 Selecione seu projeto

### 7.3 Vá em "Settings" → "Environment Variables"

### 7.4 Adicione as variáveis:
```
WHATSAPP_API_URL = https://sua-url-railway.app/message/sendText/lexio
WHATSAPP_API_KEY = lexio_api_2026_secure_key_12345
```

### 7.5 Clique em "Save"

### 7.6 Redeploy
- Vá em "Deployments"
- Clique nos 3 pontinhos do último deploy
- Clique em "Redeploy"

⏳ Aguarde 1-2 minutos...

✅ **Lexio configurado com WhatsApp!**

---

## 📊 Passo 8: Monitorar no Railway

### 8.1 Ver Logs
- Dashboard do projeto
- Clique em "View Logs"
- Você verá tudo que está acontecendo

### 8.2 Verificar Uso
- Vá em "Metrics"
- Veja CPU, RAM, Network
- Acompanhe seus $5 créditos

### 8.3 Ver Status
- Green = Funcionando
- Yellow = Iniciando
- Red = Com problema

---

## 🐛 Troubleshooting

### Problema: QR Code não aparece

**Solução:**
1. Verifique se a instância foi criada:
   ```bash
   curl https://sua-url-railway.app/instance/fetchInstances \
     -H "apikey: sua-api-key"
   ```
2. Se não aparecer, crie novamente

---

### Problema: API não responde

**Solução:**
1. Verifique os logs no Railway
2. Certifique-se que a API_KEY está correta
3. Teste o endpoint de health:
   ```
   https://sua-url-railway.app/health
   ```

---

### Problema: WhatsApp desconectou

**Solução:**
1. Gere novo QR Code:
   ```
   https://sua-url-railway.app/instance/connect/lexio
   ```
2. Escaneie novamente
3. Aguarde conectar

---

### Problema: Mensagem não chega

**Solução:**
1. Verifique o formato do número: `5511999999999` (sem espaços, traços)
2. Certifique-se que o WhatsApp está conectado
3. Veja os logs no Railway para erros

---

### Problema: Acabou o crédito

**Solução:**
- Railway oferece $5/mês
- Evolution API usa ~$2-3/mês
- Se acabar, adicione um cartão (cobra só o que usar além dos $5)

---

## 💰 Custos Estimados

| Item | Custo Mensal |
|------|-------------|
| Railway Free Tier | $5 grátis |
| Evolution API | ~$2-3 |
| Sobra | ~$2-3 |

**Total:** Geralmente **$0/mês** (dentro do free tier!)

---

## 🎯 Resumo dos Comandos Importantes

### Criar Instância:
```bash
curl -X POST https://sua-url.railway.app/instance/create \
  -H "apikey: sua-key" \
  -d '{"instanceName": "lexio", "qrcode": true}'
```

### Obter QR Code:
```
https://sua-url.railway.app/instance/connect/lexio
```

### Enviar Mensagem:
```bash
curl -X POST https://sua-url.railway.app/message/sendText/lexio \
  -H "apikey: sua-key" \
  -d '{"number": "5511999999999", "text": "Teste!"}'
```

### Listar Instâncias:
```bash
curl https://sua-url.railway.app/instance/fetchInstances \
  -H "apikey: sua-key"
```

### Status da Conexão:
```bash
curl https://sua-url.railway.app/instance/connectionState/lexio \
  -H "apikey: sua-key"
```

---

## ✅ Checklist Final

Antes de finalizar, verifique se:

- [ ] Conta Railway criada
- [ ] Evolution API deployada
- [ ] URL gerada e copiada
- [ ] Instância "lexio" criada
- [ ] QR Code escaneado
- [ ] WhatsApp conectado
- [ ] Variáveis configuradas no `.env.local`
- [ ] Variáveis configuradas no Vercel
- [ ] Teste de envio funcionou
- [ ] Logs sem erros

✅ **Tudo certo? Sistema pronto! 🚀**

---

## 🎉 Próximos Passos

1. Configure os **Cron Jobs** no Vercel (alertas automáticos)
2. Adicione mais instâncias (se necessário)
3. Configure backup da sessão WhatsApp
4. Monitore o uso no Railway

---

## 📞 Links Úteis

- **Railway Dashboard:** https://railway.app/dashboard
- **Evolution API Docs:** https://doc.evolution-api.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Lexio (seu projeto):** http://localhost:3000

---

**Dúvidas? Me chame! 🚀**

*Criado para o sistema Lexio - 2026*


