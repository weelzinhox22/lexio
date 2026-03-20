# Implementação: Aviso DataJud + Sistema de Onboarding

## 📋 Resumo

Foram implementadas 2 grandes funcionalidades:

1. **Aviso de Instabilidade DataJud** - Alerta visual para usuários
2. **Sistema de Onboarding com 5 Etapas** - Guia interativo para novos usuários

## 🔔 1. Aviso de Instabilidade DataJud

### Localização
- **Arquivo**: [components/processes/processes-search.tsx](components/processes/processes-search.tsx)

### O que foi feito
- Adicionado componente `Alert` com ícone de ⚠️ 
- Mensagem clara informando que a pesquisa DataJud está instável
- Aviso que o sistema usará dados cadastrados como fallback
- Posicionado no topo do formulário de busca

### Aparência
```
⚠️ Aviso: A pesquisa no DataJud está instável no momento e pode não 
funcionar conforme esperado. Se a busca falhar, seus processos 
cadastrados aparecerão como fallback.
```

---

## 🎯 2. Sistema de Onboarding (5 Passos)

### Componentes Criados

#### A. Modal de Onboarding
- **Arquivo**: [components/onboarding/onboarding-modal.tsx](components/onboarding/onboarding-modal.tsx)
- Exibido quando usuário faz login pela primeira vez
- Mostra progresso (N de 5 concluídos)
- Grade com 5 cards clicáveis
- Cada card leva para uma página específica

#### B. Hook de Onboarding
- **Arquivo**: [lib/hooks/useOnboarding.ts](lib/hooks/useOnboarding.ts)
- Gerencia estado de conclusão das etapas
- Salva progresso no Supabase
- Funções: `completeStep()`, `resetOnboarding()`

#### C. Dashboard Layout
- **Arquivo**: [components/dashboard/dashboard-layout.tsx](components/dashboard/dashboard-layout.tsx)
- Componente client-side que envolve a dashboard
- Verifica se usuário é novo
- Exibe modal automaticamente

#### D. API de Status
- **Arquivo**: [app/api/onboarding/status/route.ts](app/api/onboarding/status/route.ts)
- Endpoint GET para verificar status
- Retorna `isNewUser`, `completedSteps`, `userId`

---

### 5 Páginas de Onboarding

#### 1️⃣ Configuração Inicial
- **Rota**: `/onboarding/setup`
- **Arquivo**: [app/onboarding/setup/page.tsx](app/onboarding/setup/page.tsx)
- Coleta: Nome completo, Nome para publicações, Bio
- Salva em `user_profiles`

#### 2️⃣ Adicionar uma Tarefa
- **Rota**: `/onboarding/task`
- **Arquivo**: [app/onboarding/task/page.tsx](app/onboarding/task/page.tsx)
- Coleta: Título, Descrição, Data limite, Prioridade
- Salva em tabela `deadlines`

#### 3️⃣ Adicionar um Honorário
- **Rota**: `/onboarding/fee`
- **Arquivo**: [app/onboarding/fee/page.tsx](app/onboarding/fee/page.tsx)
- Coleta: Descrição, Valor, Tipo (Receita/Despesa/Honorário)
- Salva em tabela `financial_transactions`

#### 4️⃣ Tratar uma Publicação
- **Rota**: `/onboarding/publication`
- **Arquivo**: [app/onboarding/publication/page.tsx](app/onboarding/publication/page.tsx)
- Coleta: Número processo (opcional), Título, Conteúdo
- Salva em tabela `jusbrasil_publications`

#### 5️⃣ Convidar Usuários
- **Rota**: `/onboarding/invite`
- **Arquivo**: [app/onboarding/invite/page.tsx](app/onboarding/invite/page.tsx)
- Coleta: Email, Função (Member/Admin)
- Salva em tabela `team_invitations` (se existir)

---

### Componentes UI Criados

#### Dialog
- **Arquivo**: [components/ui/dialog.tsx](components/ui/dialog.tsx)
- Componente modal baseado em Radix UI
- Suporta header, footer, title, description

#### Progress
- **Arquivo**: [components/ui/progress.tsx](components/ui/progress.tsx)
- Barra de progresso baseada em Radix UI
- Mostra percentual de conclusão

---

## 🔄 Fluxo de Uso

### Primeiro Login
1. Usuário faz login
2. Dashboard carrega com `DashboardLayout`
3. Layout verifica status de onboarding via API
4. Se novo usuário → Modal abre automaticamente
5. Modal mostra 5 cards com "1 de 5", "2 de 5", etc

### Progresso
1. Usuário clica em um dos cards
2. Redireciona para página da etapa
3. Preenche formulário específico
4. Clica "Próximo Passo" (salva dados e vai para próxima página)
5. Modal atualiza mostrando progresso

### Conclusão
- Após completar 5 etapas → Botão verde "✓ Configuração Completa!"
- Próximo login → Modal não aparece mais

---

## 🎨 Design Visual

### Modal de Onboarding
- Background: Dialogo centralizado com backdrop blur
- Barra de progresso no topo
- Grid 2 colunas com cards
- Cada card mostra:
  - Número da etapa ou ✓ se completo
  - Título em negrito
  - Descrição em texto menor
  - Seta indicando ação

### Páginas de Etapas
- Fundo gradiente (slate 50 → slate 100)
- Card branco centralizado
- Ícone colorido na header
- Dicas auxiliares em cards cinzas
- Botões "Pular por Enquanto" e "Próximo Passo"

---

## 📊 Banco de Dados

### Tabela user_profiles (campos novos)
```sql
onboarding_completed_steps: integer[]  -- Array de IDs das etapas completas
```

### Uso Atual
- Etapas salvas como: [1], [1,2], [1,2,3], [1,2,3,4], [1,2,3,4,5]
- Permite que usuário volte a qualquer etapa

---

## ✅ Checklist de Implementação

- ✅ Aviso DataJud adicionado no componente de busca
- ✅ Modal de onboarding criado e funcional
- ✅ 5 páginas de onboarding implementadas
- ✅ Hook useOnboarding criado
- ✅ API de status criada
- ✅ Dashboard Layout envolvendo a página
- ✅ Componentes UI dialog e progress criados
- ✅ Build passa sem erros
- ✅ Todas as rotas `/onboarding/*` funcionando

---

## 🚀 Próximas Etapas (Opcional)

1. **Notificações de Conclusão** - Email quando etapas forem completas
2. **Validação de Email** - Antes de permitir convidar outros
3. **Avatar do Usuário** - Na página de configuração inicial
4. **Reordenação de Etapas** - Permitir que usuário customize ordem
5. **Histórico de Onboarding** - Rastrear quando cada etapa foi concluída

---

## 🧪 Como Testar

### Teste 1: Ver o Modal
1. Fazer logout: `/auth/login`
2. Criar nova conta
3. Ir para dashboard
4. Modal deve aparecer automaticamente

### Teste 2: Completar uma Etapa
1. No modal, clicar em "Configuração Inicial"
2. Preencher formulário
3. Clicar "Próximo Passo"
4. Deve ir para /onboarding/task
5. Voltar ao dashboard → Modal deve mostrar "1 de 5 concluídos"

### Teste 3: Progress Bar
1. Completar 3 etapas
2. Modal deve mostrar 60% (3/5)
3. Cards já completos devem ter ✓ verde

### Teste 4: Aviso DataJud
1. Ir para `/dashboard/processes`
2. No topo do card de busca, deve haver aviso amarelo
3. Aviso contém ícone de ⚠️ e mensagem clara

