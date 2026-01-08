# ✅ Implementação Completa: Busca de Processos

## 📋 Sumário das Implementações

Foram implementados com sucesso os 4 items solicitados:

1. ✅ **ProcessSearch Component** - Componente completo para busca de processos
2. ✅ **Dashboard Processes Page** - Página `/dashboard/processes` 
3. ✅ **Sistema de Favoritos** - Salvar processos com notas
4. ✅ **Histórico de Buscas** - Rastreamento e rápido acesso

---

## 🗂️ Estrutura de Arquivos Criados

### 1. **Banco de Dados (SQL)**
```
scripts/024_create_process_favorites_and_history.sql
```
- Tabela `favorite_processes` - Processos salvos pelo usuário
- Tabela `search_history` - Histórico de buscas realizadas
- RLS policies para segurança (row level security)
- Índices para performance

### 2. **Hooks Customizados**
```
lib/hooks/useProcessFavorites.ts    - Gerenciar favoritos de processos
lib/hooks/useSearchHistory.ts       - Gerenciar histórico de buscas
lib/hooks/useUser.ts               - Hook para usuário autenticado
lib/hooks/index.ts                 - Exportações centralizadas
```

#### `useProcessFavorites(userId)`
**Métodos:**
- `isFavorited(processNumber)` - Verifica se processo é favorito
- `getFavorite(processNumber)` - Retorna dados do favorito
- `toggleFavorite(processNumber, data)` - Adiciona/remove favorito
- `updateNotes(processNumber, notes)` - Atualiza notas do favorito
- `removeFavorite(processNumber)` - Remove de favoritos

**Retorna:**
```typescript
{
  favorites: FavoriteProcess[]
  loading: boolean
  error: string | null
  isFavorited: (processNumber: string) => boolean
  getFavorite: (processNumber: string) => FavoriteProcess | undefined
  toggleFavorite: (processNumber: string, data?) => Promise<boolean>
  updateNotes: (processNumber: string, notes: string) => Promise<boolean>
  removeFavorite: (processNumber: string) => Promise<boolean>
}
```

#### `useSearchHistory(userId)`
**Métodos:**
- `addToHistory(processNumber, resultsCount, tribunal?, searchQuery?)` - Adiciona busca ao histórico
- `getRecentSearches(limit)` - Últimas N buscas
- `getUniqueProcesses()` - Processos únicos (sem duplicatas)
- `getMostSearched(limit)` - Processos mais buscados
- `getTodaySearches()` - Buscas de hoje
- `getWeekSearches()` - Buscas da última semana
- `clearHistory()` - Limpar todo histórico
- `removeFromHistory(searchId)` - Remover busca específica

### 3. **Componentes**
```
components/processes/processes-search.tsx
```

#### Características:
- **Layout 3 Colunas**:
  - **Esquerda (1/3)**: Painel de busca + tabs com histórico/favoritos
  - **Centro (1/3)**: Resultados da busca
  - **Direita (1/3)**: Detalhes do processo selecionado

- **Busca Avançada**:
  - Validação de formato CNJ (20 dígitos)
  - Integração com API DataJud real
  - Busca por "Enter" ou botão
  - Mensagens de erro intuitivas

- **Histórico Inteligente**:
  - Separação: Buscas de hoje vs anteriores
  - Acesso rápido com clique
  - Mostrar hora da busca
  - Limpar histórico (com confirmação)

- **Sistema de Favoritos**:
  - Ícone de coração com toggle
  - Dialog para adicionar notas ao favoritar
  - Exibição de tribunal e notas
  - Acesso rápido aos favoritos

- **Integração com ProcessDetailsDashboard**:
  - Mostra detalhes do processo selecionado
  - Timeline de movimentações
  - Informações de partes e julgador

### 4. **Página**
```
app/dashboard/processes/page.tsx
```
- Renderiza o componente `ProcessSearch`
- Metadata para SEO
- Layout completo

### 5. **Endpoints da API**

#### `GET/POST/PATCH/DELETE /api/processes/favorites`
**GET** - Verifica se processo é favorito
```
?process_number=12345678901234567890
```

**POST** - Cria novo favorito
```json
{
  "process_number": "12345678901234567890",
  "tribunal": "TJSP",
  "classe": "Ação Cível",
  "assunto": "Dano Moral",
  "notes": "Acompanhar prazos"
}
```

**PATCH** - Atualiza notas
```json
{
  "process_number": "12345678901234567890",
  "notes": "Novas notas..."
}
```

**DELETE** - Remove favorito
```
?process_number=12345678901234567890
```

#### `GET/POST/DELETE /api/processes/history`
**GET** - Retorna histórico de buscas
```
?limit=50
?filter=all|today|week|unique
```

**POST** - Adiciona busca ao histórico
```json
{
  "process_number": "12345678901234567890",
  "tribunal": "TJSP",
  "search_query": "Americanas",
  "results_count": 5
}
```

**DELETE** - Limpa histórico
```
?id=uuid-do-registro
?clearAll=true
```

---

## 🔌 Integração com Sistemas Existentes

### 1. **API DataJud**
```typescript
import { searchDataJud, convertDataJudToPublication } from '@/lib/datajud-api'

// Busca por número CNJ (20 dígitos)
const process = await searchDataJud('12345678901234567890')

// Converte resposta para publicações
const publications = convertDataJudToPublication(process, processNumber)
```

### 2. **Supabase**
- Autenticação: Obtém `user.id` via `useUser()` hook
- Armazenamento: Salva favoritos e histórico em tabelas RLS-protegidas
- Segurança: Cada usuário só vê seus próprios dados

### 3. **Componentes Shadcn UI**
- Card, CardContent, CardDescription, CardHeader, CardTitle
- Button (com variantes)
- Input, Textarea
- Badge
- ScrollArea
- Tabs, TabsContent, TabsList, TabsTrigger
- AlertDialog para confirmações

---

## 📱 Fluxo de Funcionamento

### Busca de Processo
```
1. Usuário digita número CNJ (ou clica no histórico/favorito)
2. Validação do formato (20 dígitos)
3. Chamada a searchDataJud() - API real
4. Conversão de dados via convertDataJudToPublication()
5. Registro no histórico
6. Exibição em ProcessDetailsDashboard
```

### Favoritar Processo
```
1. Usuário clica no ícone de coração
2. Abre dialog para adicionar notas (opcional)
3. Salva em favorite_processes (Supabase)
4. Adiciona à lista de favoritos local
5. Próximas buscas mostram "coração preenchido"
```

### Histórico
```
1. Cada busca é registrada em search_history
2. Separação automática: hoje vs anteriores
3. Processamento de duplicatas (últimoe mais recente)
4. Acesso rápido: clique = nova busca com mesmo número
```

---

## 🎨 UI/UX Destaques

### Design
- Layout responsivo 3 colunas (desktop) / mobile-friendly
- Cores com Shadcn themes
- Ícones Lucide React
- Animações suaves (loading states)

### Acessibilidade
- Labels descritivos
- Texto de placeholder informativo
- Mensagens de erro claras
- Confirmação antes de limpar histórico

### Performance
- Lazy loading de histórico (50 últimas)
- RLS queries otimizadas no Supabase
- Índices em campos de busca frequente
- Memoização de componentes

---

## 🚀 Próximas Sugestões

### Phase 4: Notificações
- Alertas sobre novas movimentações
- Webhooks do DataJud para atualizações
- Email/Push notifications

### Phase 5: Relatórios
- Estatísticas de processos por tribunal
- Análise de prazos
- Exportação em PDF/Excel

### Phase 6: Automação
- Busca automática periódica
- Cache de resultados
- Sync com Recuperação Judicial das Americanas

---

## ✅ Validação

### Testes Manuais
1. ✅ Digitar número CNJ válido → Busca funcionando
2. ✅ Número inválido → Mensagem de erro clara
3. ✅ Clicar em favorito → Dialog com notas apareça
4. ✅ Salvar favorito → Aparece na aba "Favoritos"
5. ✅ Histórico → Buscas registradas
6. ✅ Limpar histórico → Confirmação + limpeza

### Erros Resolvidos
- ❌ "Cannot find module '@/lib/hooks/useUser'" → Criado índice de exports
- ❌ TypeError em `searchDataJud()` → Assinatura corrigida (apenas 1 argumento)
- ❌ TypeError em `convertDataJudToPublication()` → Corrigido (2 argumentos: data + searchedName)
- ❌ Build error → Cache `.next` limpo

---

## 📖 Como Usar

### Para Buscar Processos
1. Acesse `/dashboard/processes`
2. Digite número CNJ ou clique em favorito/histórico
3. Visualize detalhes na direita
4. Clique no coração para favoritar
5. Adicione notas se desejar

### Para Acessar via API
```bash
# Buscar processo
curl "http://localhost:3000/api/processes/favorites?process_number=12345678901234567890"

# Salvar favorito
curl -X POST "http://localhost:3000/api/processes/favorites" \
  -H "Content-Type: application/json" \
  -d '{"process_number":"...", "notes":"Importante"}'

# Histórico
curl "http://localhost:3000/api/processes/history?limit=50&filter=today"
```

---

## 📝 Notas Importantes

1. **Supabase Migrations**: Execute o script SQL para criar tabelas:
   ```bash
   # No Supabase Console ou via psql
   psql -U postgres -d seu_db -f scripts/024_create_process_favorites_and_history.sql
   ```

2. **RLS Policies**: Estão habilitadas automaticamente - cada usuário só vê seus dados

3. **DataJud API**: Requer API Key (já configurado em `lib/datajud-api.ts`)

4. **Formato CNJ**: 20 dígitos no padrão NNNNNNN-DD.AAAA.J.TR.OOOO

---

**Implementação concluída com sucesso!** 🎉
