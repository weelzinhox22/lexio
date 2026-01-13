# Estratégia de Produto: Themixa - MVP → Produto Real

## 🎯 1. O MOMENTO AHA

**Definição:** O advogado recebe um alerta por e-mail sobre um prazo crítico que ele não lembrava, abre o sistema, vê a Central de Prazos organizada por urgência, e pensa: *"Isso me salvou de perder um prazo importante."*

**Por que isso funciona:**
- **Tangível:** O valor é imediato e mensurável (evita perda de prazo)
- **Emocional:** Reduz ansiedade e aumenta confiança
- **Social:** O advogado recomenda: "Usei e não perdi mais nenhum prazo"

**Como garantir que aconteça:**
1. **Primeiro prazo cadastrado deve vencer em 2-3 dias** (não muito longe)
2. **Alertas ativados por padrão** (mas com opt-out claro)
3. **E-mail de teste imediato** após cadastro do primeiro prazo
4. **Dashboard mostra "1 prazo crítico"** de forma destacada

---

## 🚀 2. FLUXO DE ONBOARDING (Primeiro Acesso → Primeiro Alerta)

### Etapa 1: Cadastro (30 segundos)
- Email + Senha
- **Microcopy:** "Comece em 2 minutos. Sem cartão de crédito."

### Etapa 2: Perfil Básico (30 segundos)
- Nome completo
- Email para alertas (pré-preenchido, editável)
- **Microcopy:** "Seus alertas serão enviados aqui"

### Etapa 3: Criar Primeiro Prazo (1 minuto)
- **Template pré-preenchido:** "Prazo de resposta - Processo exemplo"
- Data: **3 dias a partir de hoje** (sugestão automática)
- Prioridade: Alta (pré-selecionada)
- **Microcopy:** "Este prazo aparecerá como crítico em 3 dias. Você receberá alertas em 7, 3, 1 dia e no dia."

### Etapa 4: Ativar Alertas (30 segundos)
- Checkbox: "Enviar alertas por e-mail" (marcado por padrão)
- **Microcopy:** "Você receberá um e-mail de teste agora mesmo"
- Botão: "Enviar e-mail de teste"
- **Feedback imediato:** "✓ E-mail enviado! Verifique sua caixa de entrada."

### Etapa 5: Dashboard com Contexto (instantâneo)
- Modal de boas-vindas: "Seu primeiro prazo está configurado!"
- Dashboard mostra: "1 prazo pendente | Próximo alerta em 7 dias"
- **CTA:** "Ver Central de Prazos"

**Tempo total:** ~3 minutos
**Objetivo:** Usuário sai com um prazo cadastrado e alertas ativados

---

## 💎 3. MELHORIAS DE UX (Confiança + Redução de Risco)

### A. Transparência de Status
- **Badge de status do sistema:** "✓ Sistema operacional" (verde) ou "⚠️ Manutenção programada" (amarelo)
- **Última execução do CRON:** "Alertas verificados há 5 minutos"
- **Contador de alertas enviados:** "127 alertas enviados hoje"

### B. Confirmação de Recebimento
- **Log de envios:** "E-mail enviado em 15/01/2025 às 14:30"
- **Status de leitura:** "E-mail entregue" (não lido, mas entregue)
- **Histórico de alertas:** Lista dos últimos 10 alertas enviados

### C. Redução de Risco Percebido
- **Disclaimer sempre visível:** "Alerta auxiliar — confira o prazo nos autos"
- **Botão "Confirmar ciência":** Aparece em prazos críticos/vencidos
- **Timeline de alertas:** Mostra quando cada alerta foi/será enviado

### D. Feedback Imediato
- **Toast ao criar prazo:** "✓ Prazo criado. Você receberá alertas em 7, 3, 1 dia e no dia."
- **Notificação in-app:** "Novo alerta: Prazo vence em 3 dias"
- **E-mail de confirmação:** "Seu prazo foi cadastrado com sucesso"

### E. Simplicidade Visual
- **Cores semânticas claras:**
  - Verde: OK/Concluído
  - Amarelo: Atenção (3-7 dias)
  - Laranja: Crítico (1-2 dias)
  - Vermelho: Vencido
- **Ícones consistentes:** ⏰ para prazos, 📧 para alertas, ✓ para confirmado

---

## 📊 4. CENTRAL DE PRAZOS (Estrutura com Estados Claros)

### Estados Definidos:

#### 🟢 **OK** (Verde)
- **Critério:** Mais de 7 dias para vencer
- **Visual:** Badge verde, card com borda verde clara
- **Ação:** Nenhuma ação urgente

#### 🟡 **PRÓXIMO** (Amarelo)
- **Critério:** Entre 4 e 7 dias para vencer
- **Visual:** Badge amarelo, card com borda amarela
- **Ação:** "Atenção: prazo se aproxima"

#### 🟠 **CRÍTICO** (Laranja)
- **Critério:** Entre 1 e 3 dias para vencer
- **Visual:** Badge laranja, card com fundo laranja claro, borda laranja
- **Ação:** "Ação necessária em breve"

#### 🔴 **VENCIDO** (Vermelho)
- **Critério:** Data passou e não foi confirmado
- **Visual:** Badge vermelho, card com fundo vermelho claro, borda vermelha, ícone de alerta
- **Ação:** "Ação imediata necessária"

### Layout da Central:

```
┌─────────────────────────────────────────────────┐
│  Central de Prazos                    [Filtros]│
├─────────────────────────────────────────────────┤
│  📊 Resumo:                                     │
│  🟢 12 OK  🟡 3 Próximos  🟠 2 Críticos  🔴 1   │
├─────────────────────────────────────────────────┤
│                                                 │
│  🔴 VENCIDOS (1)                                │
│  ┌───────────────────────────────────────────┐ │
│  │ ⚠️ Resposta à inicial                      │ │
│  │ Processo: 1234567-89.2023.8.26.0101       │ │
│  │ Vencido há 2 dias                         │ │
│  │ [Confirmar ciência]                       │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  🟠 CRÍTICOS (2)                                │
│  ┌───────────────────────────────────────────┐ │
│  │ 🚨 Contestação                             │ │
│  │ Processo: 9876543-21.2023.8.26.0101      │ │
│  │ Vence em 1 dia                            │ │
│  │ [Confirmar ciência]                       │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  🟡 PRÓXIMOS (3)                                │
│  ┌───────────────────────────────────────────┐ │
│  │ ⏰ Manifestação                            │ │
│  │ Processo: 1111111-11.2023.8.26.0101      │ │
│  │ Vence em 5 dias                            │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  🟢 OK (12)                                     │
│  [Mostrar todos / Ocultar]                      │
└─────────────────────────────────────────────────┘
```

### Funcionalidades:
- **Filtros:** Por estado, processo, data
- **Ordenação:** Vencidos primeiro, depois por data
- **Busca:** Por título, processo, descrição
- **Ações rápidas:** Confirmar ciência, Editar, Ver processo

---

## ✍️ 5. MICROCOPIES ESTRATÉGICAS

### Prazo Crítico (1-3 dias)
**Título do card:**
> 🚨 **Prazo crítico: [Título]**

**Descrição:**
> Este prazo vence em [X] dia(s). Ação necessária em breve.

**CTA:**
> [Confirmar ciência] [Ver detalhes]

**Tooltip:**
> Você receberá alertas diários até a data do prazo.

---

### Prazo Vencido
**Título do card:**
> ⚠️ **Prazo vencido: [Título]**

**Descrição:**
> Este prazo venceu há [X] dia(s). Verifique os autos do processo imediatamente.

**CTA:**
> [Confirmar ciência] [Ver processo]

**Tooltip:**
> Após confirmar, este prazo não aparecerá mais como vencido.

**Modal de confirmação:**
> Você confirma que tomou ciência deste prazo vencido? Esta ação não pode ser desfeita.

---

### Alerta Enviado
**Toast (in-app):**
> ✓ Alerta enviado por e-mail em [data/hora]

**Badge no card:**
> 📧 Último alerta: [data/hora]

**Tooltip:**
> Você receberá o próximo alerta em [X] dias.

**E-mail (assunto):**
> ⚠️ Prazo crítico: [Título] vence em [X] dias

**E-mail (corpo - início):**
> Olá [Nome],
> 
> Você tem um prazo importante se aproximando:
> 
> **Prazo:** [Título]
> **Vence em:** [Data] ([X] dias)
> **Processo:** [Número] (se houver)
> 
> [Ver no Themixa] [Confirmar ciência]

---

### Erro de Envio
**Toast (in-app):**
> ⚠️ Não foi possível enviar o alerta por e-mail. Verifique suas configurações.

**Badge no card:**
> ❌ Erro ao enviar alerta

**Tooltip:**
> Clique para ver detalhes do erro e como resolver.

**Modal de erro:**
> **Erro ao enviar alerta**
> 
> Não foi possível enviar o alerta por e-mail para [email].
> 
> **Possíveis causas:**
> - E-mail inválido ou inativo
> - Problema temporário do servidor
> - Configurações de e-mail alteradas
> 
> **O que fazer:**
> 1. Verifique se o e-mail está correto em [Configurações]
> 2. Tente reenviar o alerta manualmente
> 3. Se o problema persistir, entre em contato com o suporte
> 
> [Ver configurações] [Tentar novamente] [Fechar]

**E-mail de fallback (se houver e-mail alternativo):**
> Tentamos enviar um alerta para [email principal], mas houve um erro.
> 
> Enviando este alerta para [email alternativo] como backup.
> 
> [Conteúdo do alerta normal]

---

## 💰 6. PRECIFICAÇÃO INICIAL (Free vs Pro)

### 🆓 **FREE** (Gratuito)
**Limites:**
- 10 prazos ativos simultaneamente
- 5 processos cadastrados
- Alertas por e-mail: 3 por dia (máximo)
- Sem histórico de alertas (apenas últimos 7 dias)
- Sem integração Google Calendar
- Suporte: E-mail (resposta em 48h)

**Ideal para:**
- Advogados autônomos iniciantes
- Teste do produto
- Escritórios muito pequenos (1-2 pessoas)

**Objetivo:** Aquisição e ativação

---

### 💎 **PRO** (R$ 49/mês ou R$ 490/ano)
**Limites:**
- Prazos ilimitados
- Processos ilimitados
- Alertas ilimitados
- Histórico completo de alertas
- Integração Google Calendar
- Múltiplos e-mails de destino
- Personalização de alertas (dias antes)
- Exportação de relatórios
- Suporte prioritário (resposta em 24h)

**Ideal para:**
- Advogados autônomos estabelecidos
- Escritórios pequenos (3-10 pessoas)
- Advogados com muitos processos

**Objetivo:** Retenção e expansão

---

### 🎯 **Estratégia de Conversão:**
1. **Free trial de 14 dias do Pro** após cadastro
2. **Upgrade prompt:** Aparece quando usuário atinge 8 prazos (80% do limite)
3. **Microcopy no limite:** "Você atingiu 10 prazos. [Upgrade para Pro] para prazos ilimitados."
4. **Teste social:** "Mais de 500 advogados já usam o Pro"

---

## 🚫 7. ANTI-FEATURES (O que NÃO fazer agora)

### ❌ **NÃO Implementar:**
1. **WhatsApp:** Complexidade técnica alta, baixo ROI inicial
2. **App Mobile:** Foco em web responsiva primeiro
3. **IA Avançada:** Detecção automática de prazos em PDFs (muito complexo)
4. **Integração com tribunais:** Muito instável (como visto com DataJud)
5. **Chat em tempo real:** Suporte por e-mail é suficiente
6. **Relatórios complexos:** Dashboard simples é melhor
7. **Multi-idioma:** Foco no mercado brasileiro
8. **API pública:** Não é prioridade agora
9. **Marketplace de templates:** Complexidade desnecessária
10. **Gamificação:** Não combina com o público jurídico

### ✅ **Fazer Depois (Fase 2):**
1. App mobile (após validação web)
2. Integração com mais calendários (Outlook, iCal)
3. Relatórios avançados (após ter dados suficientes)
4. API para integrações (quando houver demanda)

### 🎯 **Foco Atual:**
- **Simplicidade:** Fazer uma coisa muito bem (alertas de prazos)
- **Confiabilidade:** Sistema sempre funcionando
- **Clareza:** Interface que qualquer advogado entende
- **Retenção:** Usuário volta todo dia para ver prazos

---

## 📈 8. MÉTRICAS DE SUCESSO

### Aquisição:
- Taxa de cadastro: > 20% dos visitantes
- Tempo de onboarding: < 5 minutos

### Ativação:
- % que cria primeiro prazo: > 80%
- % que ativa alertas: > 70%
- Tempo até primeiro alerta recebido: < 7 dias

### Retenção:
- DAU (Daily Active Users): > 40%
- MAU (Monthly Active Users): > 60%
- Churn mensal: < 10%

### Conversão:
- Taxa de upgrade para Pro: > 5% (após 30 dias)
- MRR (Monthly Recurring Revenue): Meta de R$ 5.000 em 6 meses

### Engajamento:
- Prazos cadastrados por usuário: > 5 (média)
- Alertas enviados por usuário/mês: > 10
- Taxa de abertura de e-mails: > 50%

---

## 🎨 9. PRINCÍPIOS DE DESIGN

1. **Clareza sobre criatividade:** Interface funcional > bonita
2. **Consistência:** Mesmas cores, ícones e padrões em todo o sistema
3. **Feedback imediato:** Toda ação tem resposta visual
4. **Erro humano:** Sempre permitir desfazer ações
5. **Mobile-first:** Funciona bem no celular (mesmo sendo web)
6. **Acessibilidade:** Contraste adequado, textos legíveis

---

## 🚀 10. ROADMAP PRÓXIMOS 90 DIAS

### Semana 1-2: Melhorias de UX
- [ ] Implementar Central de Prazos com estados claros
- [ ] Adicionar microcopies estratégicas
- [ ] Melhorar feedback de envio de alertas
- [ ] Adicionar log de alertas enviados

### Semana 3-4: Onboarding Otimizado
- [ ] Redesenhar fluxo de onboarding (foco no momento AHA)
- [ ] Adicionar e-mail de teste imediato
- [ ] Criar template de primeiro prazo
- [ ] Dashboard contextual para novos usuários

### Semana 5-6: Confiança e Transparência
- [ ] Badge de status do sistema
- [ ] Histórico de alertas enviados
- [ ] Melhor tratamento de erros
- [ ] Página de status/health check

### Semana 7-8: Precificação
- [ ] Implementar limites do Free
- [ ] Criar página de planos
- [ ] Integração com Stripe (se ainda não houver)
- [ ] Fluxo de upgrade

### Semana 9-12: Validação e Iteração
- [ ] Testes com usuários reais
- [ ] Ajustes baseados em feedback
- [ ] Otimização de performance
- [ ] Documentação para usuários

---

## 📝 CONCLUSÃO

O Themixa já tem uma base sólida. O foco agora deve ser:

1. **Garantir o momento AHA** através de onboarding direto
2. **Aumentar confiança** com transparência e feedback
3. **Simplificar a experiência** removendo complexidade desnecessária
4. **Validar o modelo de negócio** com precificação clara

**Lembre-se:** Um produto simples que funciona bem é melhor que um produto complexo que funciona mal.

