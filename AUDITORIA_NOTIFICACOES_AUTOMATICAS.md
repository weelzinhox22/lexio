# 🔍 Auditoria: Notificações Automáticas de Prazos

## 📋 Resumo Executivo

**Status**: Sistema implementado, mas pode não estar sendo executado automaticamente.

**Problema Identificado**: O cron job está configurado, mas precisa ser validado se está rodando no Vercel.

**Ação Requerida**: Verificar logs do Vercel e garantir que o cron está configurado e executando.

---

## 🗺️ Mapeamento do Fluxo Completo

### 1. Configuração do Cron

**Arquivo**: `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/check-deadlines",
      "schedule": "0 8 * * *"  // 8h UTC (5h BRT) - Uma vez por dia
    }
  ]
}
```

**Endpoint**: `/api/cron/check-deadlines` → delega para `/api/cron/deadline-alerts/route.ts`

**Frequência**: Uma vez por dia às 8h UTC (5h da manhã no horário de Brasília)

### 2. Fluxo de Execução

```
Vercel Cron (8h UTC)
  ↓
GET /api/cron/check-deadlines
  ↓
GET /api/cron/deadline-alerts (com CRON_SECRET)
  ↓
1. Buscar todos deadlines ativos (status != 'completed')
  ↓
2. Para cada deadline:
   a. Calcular alert_status (active/urgent/overdue/done)
   b. Gerar planos de alerta (buildAlertPlan)
   c. Para cada plano:
      - Verificar elegibilidade (isEligibleForDeadlineEmail)
      - Criar registro de notificação (createEmailNotificationRecord)
      - Enviar e-mail via Brevo (sendDeadlineAlertEmail)
      - Atualizar status da notificação
```

### 3. Lógica de Tempo (UTC)

**Função**: `daysUntilUTC(deadlineIso: string, now: Date)`

**Comportamento**:
- Converte `deadline_date` para UTC
- Calcula diferença em dias (arredondado)
- Retorna número negativo se vencido, 0 se hoje, positivo se futuro

**Exemplo**:
- Deadline: `2024-01-15T10:00:00Z`
- Agora: `2024-01-08T08:00:00Z`
- Resultado: `7` (exatamente 7 dias antes)

### 4. Regras de Alerta

O sistema gera alertas apenas quando `daysUntilUTC` resulta em:
- `7` → DUE_IN_7_DAYS
- `3` → DUE_IN_3_DAYS
- `1` → DUE_IN_1_DAY
- `0` → DUE_TODAY
- `< 0` → OVERDUE

**Importante**: O cron roda UMA VEZ por dia. Se um deadline entra na janela de 7 dias às 8:01 UTC, ele só será detectado no próximo dia às 8h UTC.

### 5. Elegibilidade de E-mail

**Função**: `isEligibleForDeadlineEmail()`

**Condições**:
1. ✅ `email_enabled === true` (default: true)
2. ✅ `toEmail` não vazio (email_override OU email do perfil)
3. ✅ `daysRemaining` está em `alert_days` (default: [7, 3, 1, 0])
4. ✅ `daysRemaining >= 0` (OVERDUE não envia por padrão)

### 6. Deduplicação

**Índice Único**: `uniq_notifications_dedupe` em `(user_id, channel, dedupe_key)`

**Estratégia**:
- Para alertas normais: `deadline:{id}:{rule}:{YYYY-MM-DD}`
- Para OVERDUE: `deadline:{id}:OVERDUE:{YYYY-MM-DD}` (envia uma vez por dia)

Se o registro já existe, `createEmailNotificationRecord` retorna `{ created: false }` e o e-mail NÃO é enviado.

---

## 🐛 Problemas Identificados

### ❌ Problema #1: Cron pode não estar rodando

**Sintoma**: E-mails de teste funcionam, mas alertas automáticos não chegam.

**Causa Provável**: O cron do Vercel precisa ser configurado manualmente no dashboard do Vercel.

**Como Verificar**:
1. Acessar Vercel Dashboard → Projeto → Settings → Cron Jobs
2. Verificar se `/api/cron/check-deadlines` está listado
3. Verificar logs de execução

**Como Corrigir**:
- Se não estiver configurado: O `vercel.json` deve ser suficiente, mas pode precisar de deploy
- Se estiver configurado mas não rodando: Verificar logs do Vercel

### ❌ Problema #2: CRON_SECRET não configurado

**Sintoma**: Cron retorna 401 Unauthorized.

**Causa**: Variável `CRON_SECRET` não está definida no Vercel.

**Como Corrigir**:
1. Definir `CRON_SECRET` nas variáveis de ambiente do Vercel
2. Valor deve ser igual ao usado no header `Authorization: Bearer <CRON_SECRET>`

### ❌ Problema #3: Cron roda apenas uma vez por dia

**Limitação**: O cron roda às 8h UTC. Se um deadline precisa de alerta às 10h, ele só será processado no próximo dia.

**Impacto**: Baixo - alertas ainda chegam, apenas com atraso de até 24h.

**Solução (futura)**: Rodar cron múltiplas vezes por dia (ex: a cada 6 horas).

---

## 🔧 Soluções Implementadas

### ✅ 1. Logs Detalhados

Adicionados logs em cada etapa:
- Início da execução
- Deadlines encontrados
- Cálculo de dias até prazo
- Elegibilidade de e-mail
- Envio via Brevo
- Resumo final

**Exemplo de log**:
```
⏰ [DeadlineAlerts Cron] INÍCIO DA EXECUÇÃO
📋 [DeadlineAlerts Cron] Encontrados 5 deadline(s) ativo(s)
📅 [DeadlineAlerts Cron] Processando deadline: abc-123
   └─ Dias até o prazo: 7
   └─ ✅ 1 plano(s) de alerta gerado(s)
   └─ ✅ Email ELIGÍVEL para envio
      📨 ENVIANDO E-MAIL via Brevo...
      ✅ BREVO OK - E-mail enviado com sucesso
```

### ✅ 2. Endpoint de Debug

**Endpoint**: `GET /api/dev/debug-deadline-cron?deadlineId=xxx`

**Funcionalidades**:
- Simula o fluxo completo do cron
- Analisa um deadline específico (ou vários)
- Mostra todos os cálculos e decisões
- Não requer CRON_SECRET (apenas em dev)

**Uso**:
```bash
# Analisar um deadline específico
curl "http://localhost:3000/api/dev/debug-deadline-cron?deadlineId=abc-123"

# Analisar primeiros 10 deadlines
curl "http://localhost:3000/api/dev/debug-deadline-cron"
```

**Resposta**:
```json
{
  "debug_mode": true,
  "timestamp_utc": "2024-01-08T10:00:00.000Z",
  "deadlines_analyzed": 1,
  "results": [
    {
      "deadline": { ... },
      "calculation": {
        "days_until": 7,
        "computed_alert_status": "active"
      },
      "plans": [ ... ],
      "email_analysis": {
        "would_send_email": true,
        "eligible_plans": [ ... ],
        "skipped_plans": [ ... ]
      }
    }
  ]
}
```

### ✅ 3. Validação de Datas UTC

Todas as datas são processadas em UTC:
- `deadline_date` do banco (TIMESTAMPTZ)
- `new Date()` no servidor (UTC)
- `daysUntilUTC()` calcula diferença em UTC

**Sem problemas de timezone identificados.**

---

## 📊 Checklist de Diagnóstico

Use este checklist para diagnosticar problemas:

- [ ] **Cron configurado no Vercel?**
  - Verificar: Vercel Dashboard → Settings → Cron Jobs
  - Deve aparecer: `/api/cron/check-deadlines` com schedule `0 8 * * *`

- [ ] **CRON_SECRET configurado?**
  - Verificar: Vercel Dashboard → Settings → Environment Variables
  - Deve existir: `CRON_SECRET` com valor definido

- [ ] **Cron está executando?**
  - Verificar: Vercel Dashboard → Deployments → Function Logs
  - Procurar por: `⏰ [DeadlineAlerts Cron] INÍCIO DA EXECUÇÃO`
  - Se não aparecer: Cron não está sendo chamado

- [ ] **Deadlines existem?**
  - Verificar: Supabase → Table `deadlines`
  - Filtrar: `status != 'completed'`
  - Se vazio: Não há deadlines para processar

- [ ] **Configurações de notificação corretas?**
  - Verificar: Supabase → Table `notification_settings`
  - Verificar: `email_enabled = true`
  - Verificar: `alert_days` contém os dias desejados

- [ ] **E-mail de destino válido?**
  - Verificar: `email_override` OU `profiles.email`
  - Deve ser um e-mail válido

- [ ] **Brevo configurado?**
  - Verificar: Variáveis `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `BREVO_FROM_NAME`
  - Testar: `GET /api/dev/test-email?to=seu@email.com`

---

## 🧪 Como Testar

### Teste 1: Debug de um Deadline

```bash
# 1. Buscar ID de um deadline
# 2. Executar debug
curl "http://localhost:3000/api/dev/debug-deadline-cron?deadlineId=SEU_DEADLINE_ID"
```

### Teste 2: Simular Execução do Cron

```bash
# Executar manualmente (requer CRON_SECRET)
curl -X GET "https://seu-app.vercel.app/api/cron/check-deadlines" \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Teste 3: Testar Envio de E-mail

```bash
# Testar envio básico
curl "http://localhost:3000/api/dev/test-email?to=seu@email.com"

# Testar envio de alerta de deadline
curl -X POST "http://localhost:3000/api/dev/test-deadline-alert" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"to": "seu@email.com"}'
```

---

## 📝 Conclusão

### Problema Principal Identificado

**O cron está implementado corretamente, mas pode não estar sendo executado pelo Vercel.**

### Solução Imediata

1. ✅ Verificar se o cron está configurado no Vercel Dashboard
2. ✅ Verificar logs do Vercel para ver se o cron está sendo executado
3. ✅ Usar endpoint de debug para validar lógica
4. ✅ Verificar variáveis de ambiente (`CRON_SECRET`, `BREVO_*`)

### Código

- ✅ Lógica de tempo correta (UTC)
- ✅ Deduplicação funcionando
- ✅ Elegibilidade de e-mail correta
- ✅ Logs detalhados adicionados
- ✅ Endpoint de debug criado

### Próximos Passos

1. Verificar logs do Vercel para confirmar execução do cron
2. Se não estiver executando: Verificar configuração do Vercel
3. Se estiver executando mas e-mails não chegam: Verificar logs de Brevo
4. Considerar aumentar frequência do cron (múltiplas vezes por dia)

---

**Última atualização**: 2024-01-08
**Auditoria realizada por**: Sistema automatizado



