# 🆓 Guia Completo: VPS Gratuitas para Evolution API

## 🎯 Melhores Opções de VPS Gratuitas (2026)

### 1. Railway.app ⭐ RECOMENDADO
**Créditos:** $5/mês grátis (suficiente para Evolution API)

**Vantagens:**
- ✅ Deploy extremamente fácil (1 clique)
- ✅ Sem necessidade de Docker manual
- ✅ Dashboard intuitivo
- ✅ Logs em tempo real
- ✅ HTTPS automático

**Limitações:**
- ⚠️ $5 créditos mensais (renova todo mês)
- ⚠️ Após $5, precisa adicionar cartão

**Passo a Passo:**

1. **Crie conta no Railway:**
   - Acesse: https://railway.app
   - Sign up com GitHub

2. **Deploy da Evolution API:**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Use este template: https://github.com/EvolutionAPI/evolution-api
   - Ou clique aqui: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/evolution-api)

3. **Configure as variáveis:**
   ```env
   AUTHENTICATION_API_KEY=sua-chave-segura-aqui-12345
   ```

4. **Obtenha a URL:**
   - Railway gera automaticamente: `https://seu-app.railway.app`
   - Use esta URL no seu sistema

5. **Configure no Vercel:**
   ```env
   WHATSAPP_API_URL=https://seu-app.railway.app/message/sendText/sua-instancia
   WHATSAPP_API_KEY=sua-chave-segura-aqui-12345
   ```

---

### 2. Render.com
**Plano Free:** 750 horas/mês

**Vantagens:**
- ✅ 100% gratuito (não precisa cartão)
- ✅ Deploy via Docker
- ✅ HTTPS automático
- ✅ Logs e métricas

**Limitações:**
- ⚠️ "Dorme" após 15 min sem uso
- ⚠️ Demora ~30s para "acordar"
- ⚠️ Pode perder QR Code ao dormir

**Passo a Passo:**

1. **Crie conta no Render:**
   - Acesse: https://render.com
   - Sign up com GitHub

2. **Crie Web Service:**
   - Dashboard → "New +" → "Web Service"
   - Conecte seu GitHub ou use Docker direto

3. **Configure Docker:**
   ```
   Docker Image: atendai/evolution-api
   Instance Type: Free
   ```

4. **Variáveis de Ambiente:**
   ```env
   AUTHENTICATION_API_KEY=sua-chave-segura
   PORT=8080
   ```

5. **Evite que durma (opcional):**
   - Use serviço de ping: https://cron-job.org
   - Ping a cada 10 minutos: `https://seu-app.onrender.com/health`

---

### 3. Fly.io
**Plano Free:** 3GB RAM, 160GB bandwidth/mês

**Vantagens:**
- ✅ Não dorme (sempre ativo!)
- ✅ Boa performance
- ✅ CLI poderosa

**Limitações:**
- ⚠️ Requer cartão (mas não cobra no free tier)
- ⚠️ Setup mais técnico

**Passo a Passo:**

1. **Instale a CLI do Fly:**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Mac/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Faça login:**
   ```bash
   fly auth login
   ```

3. **Crie arquivo `fly.toml`:**
   ```toml
   app = "seu-app-evolution"
   primary_region = "gru"  # São Paulo

   [build]
     image = "atendai/evolution-api"

   [env]
     PORT = "8080"
     AUTHENTICATION_API_KEY = "sua-chave-segura"

   [[services]]
     internal_port = 8080
     protocol = "tcp"

     [[services.ports]]
       port = 80
       handlers = ["http"]

     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]
   ```

4. **Deploy:**
   ```bash
   fly launch
   fly deploy
   ```

5. **URL gerada:**
   ```
   https://seu-app-evolution.fly.dev
   ```

---

### 4. Oracle Cloud (Always Free) 💪
**Plano Free:** 4 CPUs, 24GB RAM (!!)

**Vantagens:**
- ✅ MUITO poder (melhor specs)
- ✅ Sempre gratuito (não expira)
- ✅ VPS completa (acesso root)
- ✅ IP fixo

**Limitações:**
- ⚠️ Setup manual (mais complexo)
- ⚠️ Requer cartão internacional
- ⚠️ Interface confusa

**Passo a Passo:**

1. **Crie conta Oracle Cloud:**
   - Acesse: https://cloud.oracle.com
   - Cadastre-se (precisa cartão - mas não cobra)

2. **Crie VM:**
   - Menu → Compute → Instances → Create Instance
   - Shape: Ampere A1 (Always Free)
   - Image: Ubuntu 22.04
   - Networking: Public IP

3. **Conecte via SSH:**
   ```bash
   ssh ubuntu@seu-ip-publico
   ```

4. **Instale Docker:**
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker ubuntu
   ```

5. **Rode Evolution API:**
   ```bash
   docker run -d \
     --name evolution-api \
     --restart always \
     -p 8080:8080 \
     -e AUTHENTICATION_API_KEY=sua-chave-segura \
     atendai/evolution-api
   ```

6. **Configure firewall:**
   ```bash
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT
   sudo netfilter-persistent save
   ```

7. **No painel Oracle:**
   - VCN → Security Lists → Ingress Rules
   - Add Rule: TCP, Port 8080, Source 0.0.0.0/0

8. **Use sua API:**
   ```
   http://seu-ip-oracle:8080
   ```

---

### 5. Koyeb
**Plano Free:** 1GB RAM, sempre ativo

**Vantagens:**
- ✅ Sem cartão
- ✅ Não dorme
- ✅ Deploy fácil

**Limitações:**
- ⚠️ Menos recursos
- ⚠️ Pode ter fila de deploy

**Passo a Passo:**

1. **Acesse:** https://koyeb.com
2. **New App → Docker**
3. **Image:** `atendai/evolution-api`
4. **Port:** `8080`
5. **Environment Variables:**
   ```
   AUTHENTICATION_API_KEY=sua-chave
   ```
6. **Deploy!**

---

## 📊 Comparação Rápida

| Plataforma | Free Tier | Dorme? | Cartão? | Dificuldade |
|-----------|-----------|--------|---------|-------------|
| **Railway** | $5/mês | ❌ | Após $5 | ⭐ Fácil |
| **Render** | 750h/mês | ✅ 15min | ❌ | ⭐ Fácil |
| **Fly.io** | 3GB RAM | ❌ | Sim* | ⭐⭐ Médio |
| **Oracle** | 24GB RAM | ❌ | Sim* | ⭐⭐⭐ Difícil |
| **Koyeb** | 1GB RAM | ❌ | ❌ | ⭐ Fácil |

*Não cobra no free tier

---

## 🏆 Recomendação Final

### Para Iniciantes: **Railway.app**
- Mais fácil de todas
- $5/mês suficiente para uso moderado
- Deploy em 2 minutos

### Para Produção: **Oracle Cloud**
- Melhor custo-benefício
- Sempre gratuito
- Performance profissional

### Para Testes: **Render.com**
- 100% grátis sem cartão
- Ótimo para experimentar

---

## 🔧 Após o Deploy

### 1. Conecte o WhatsApp

```bash
# Crie instância
curl -X POST https://sua-url.com/instance/create \
  -H "apikey: sua-chave" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "legalflow", "qrcode": true}'

# Obtenha QR Code
curl https://sua-url.com/instance/connect/legalflow \
  -H "apikey: sua-chave"
```

### 2. Configure no seu projeto

No Vercel (Environment Variables):
```env
WHATSAPP_API_URL=https://sua-url.com/message/sendText/legalflow
WHATSAPP_API_KEY=sua-chave-segura
```

### 3. Teste o envio

```bash
curl -X POST $WHATSAPP_API_URL \
  -H "apikey: $WHATSAPP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Teste do LegalFlow!"
  }'
```

---

## 🆘 Troubleshooting

### API não responde
```bash
# Verifique se está rodando
curl https://sua-url.com/health

# Veja os logs
# Railway: Dashboard → Logs
# Render: Dashboard → Logs
# Fly: fly logs
```

### QR Code expirou
```bash
# Reconecte
curl https://sua-url.com/instance/connect/legalflow \
  -H "apikey: sua-chave"
```

### Instância desconectou
- Render: Pode ter dormido (use ping)
- Todas: Refaça a conexão do WhatsApp

---

## 💡 Dicas Importantes

1. **Mantenha a chave API secreta** - nunca exponha no frontend
2. **Use WhatsApp Business** - mais profissional
3. **Teste primeiro** antes de usar em produção
4. **Configure backup** da sessão do WhatsApp
5. **Monitore os logs** para erros

---

## 📞 Suporte

Escolha a opção que melhor se adequa ao seu nível técnico:
- **Nunca usei terminal?** → Railway
- **Já uso GitHub?** → Render ou Railway
- **Conhece Docker?** → Fly.io
- **Sou desenvolvedor?** → Oracle Cloud

Boa sorte! 🚀


