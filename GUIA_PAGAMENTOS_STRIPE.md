# 💳 Guia de Implementação de Pagamentos - Stripe

## 🎯 Estrutura Criada

### ✅ Arquivos Criados

1. **`app/api/stripe/create-checkout/route.ts`**
   - Cria sessão de checkout no Stripe
   - Retorna URL para redirecionamento

2. **`app/api/stripe/webhook/route.ts`**
   - Recebe eventos do Stripe
   - Atualiza subscriptions no banco automaticamente

---

## 📋 Como Implementar

### 1. Criar Conta no Stripe

1. Acesse: https://stripe.com
2. Crie uma conta (gratuita)
3. Ative o modo de teste primeiro

### 2. Obter Chaves da API

No Stripe Dashboard:
- **Publishable Key** → Use no frontend
- **Secret Key** → Use no backend (NUNCA exponha!)

### 3. Criar Produtos e Preços

No Stripe Dashboard → Products:

**Plano Básico:**
- Nome: "Themixa - Plano Básico"
- Preço: R$ 97,00
- Recorrência: Mensal
- Copie o `price_id` (ex: `price_xxxxx`)

**Plano Premium:**
- Nome: "Themixa - Plano Premium"
- Preço: R$ 197,00
- Recorrência: Mensal
- Copie o `price_id`

**Plano Enterprise:**
- Nome: "Themixa - Plano Enterprise"
- Preço: R$ 397,00
- Recorrência: Mensal
- Copie o `price_id`

### 4. Configurar Variáveis de Ambiente

Adicione no `.env.local`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**No Vercel:**
- Settings → Environment Variables
- Adicione as mesmas variáveis

### 5. Configurar Webhook

No Stripe Dashboard → Developers → Webhooks:

1. Clique em "Add endpoint"
2. URL: `https://seu-dominio.vercel.app/api/stripe/webhook`
3. Eventos para escutar:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copie o **Signing Secret** → Adicione em `STRIPE_WEBHOOK_SECRET`

---

## 💻 Integração no Frontend

### Atualizar Página de Subscription

```typescript
// Adicionar função de checkout
const handleCheckout = async (planId: string, priceId: string) => {
  const response = await fetch('/api/stripe/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, priceId }),
  })
  
  const { url } = await response.json()
  window.location.href = url // Redireciona para Stripe
}
```

---

## 🔄 Fluxo de Pagamento

1. **Usuário clica em "Assinar"**
   - Frontend chama `/api/stripe/create-checkout`
   - Backend cria sessão no Stripe
   - Retorna URL de checkout

2. **Usuário paga no Stripe**
   - Stripe processa pagamento
   - Redireciona para `success_url`

3. **Webhook atualiza banco**
   - Stripe envia evento `checkout.session.completed`
   - Webhook atualiza `subscriptions` no Supabase
   - Subscription fica ativa

---

## 🧪 Testar em Modo de Teste

### Cartões de Teste

- **Sucesso:** `4242 4242 4242 4242`
- **Falha:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

Qualquer data futura, qualquer CVC.

---

## 📊 Verificar Pagamentos

### No Stripe Dashboard:
- Payments → Ver todos os pagamentos
- Customers → Ver clientes
- Subscriptions → Ver assinaturas ativas

### No Supabase:
```sql
SELECT * FROM subscriptions 
WHERE status = 'active'
ORDER BY created_at DESC;
```

---

## 🚀 Alternativas ao Stripe

### 1. **Mercado Pago**
- Mais popular no Brasil
- Aceita PIX, boleto, cartão
- API similar ao Stripe

### 2. **Asaas**
- Focado em assinaturas
- Boa para SaaS brasileiro
- Suporte em português

### 3. **PagSeguro**
- Integração simples
- Aceita múltiplos métodos
- Taxas competitivas

---

## 💡 Recomendação

**Para começar:** Use **Stripe** (mais fácil e documentado)

**Para produção no Brasil:** Considere **Mercado Pago** ou **Asaas**

---

## ✅ Checklist

- [ ] Conta Stripe criada
- [ ] Produtos e preços criados
- [ ] Chaves da API configuradas
- [ ] Webhook configurado
- [ ] Variáveis de ambiente adicionadas
- [ ] Testado com cartão de teste
- [ ] Verificado atualização no banco

---

## 🆘 Problemas Comuns

### Webhook não funciona
- Verifique se a URL está correta
- Verifique se o `STRIPE_WEBHOOK_SECRET` está correto
- Veja logs no Stripe Dashboard → Webhooks

### Pagamento não atualiza subscription
- Verifique logs do webhook
- Verifique se o `user_id` está no metadata
- Verifique se a tabela `subscriptions` existe

