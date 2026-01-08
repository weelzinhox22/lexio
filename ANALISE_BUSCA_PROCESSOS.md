# Análise e Recomendações: Integração de Busca de Processos

## 📋 Análise da Lógica de Busca por Leis

A busca por leis funciona com 3 etapas principais:

### 1. **Componente Cliente** (`components/laws/laws-search.tsx`)
- Input com busca em tempo real (debounce de 300ms)
- Busca inteligente em múltiplos campos (nome, número, categoria, keywords)
- Ordenação por relevância (prioriza matches no nome)
- Interface com 3 colunas (busca, resultados, visualização)
- Funcionalidade de favoritos com notas

### 2. **Dados Estáticos**
- Array `BRAZILIAN_LAWS` com base de leis
- Array `POPULAR_LAWS` para exibição inicial
- Cada lei tem: nome, número, url, categoria, descrição

### 3. **APIs de Backend**
- `GET /api/laws/favorite?law_url=...` - Verifica se é favorita
- `POST /api/laws/favorite` - Adiciona aos favoritos
- `DELETE /api/laws/favorite?law_url=...` - Remove dos favoritos
- `PATCH /api/laws/favorite/update` - Atualiza notas

---

## ✅ Recomendação: Busca de Processos Similar

Para processos, proponho a mesma estrutura com adaptações:

### **1. Dados de Processos**
```typescript
interface ProcessoSimples {
  numeroProcesso: string
  classe: string
  assunto: string
  tribunal: string
  dataAjuizamento: string
  status: 'Ativo' | 'Arquivado' | 'Suspenso'
  descripacao?: string
}

// Inicialmente vazio ou com exemplos
const PROCESSOS_CACHE: ProcessoSimples[] = []
```

### **2. Componente `ProcessSearch`**
Replicaria a estrutura `LawsSearch` com:

- **Input**: Número do processo (20 dígitos CNJ)
- **Busca**: Em tempo real que chama a API DataJud
- **Resultados**: Lista de processos encontrados
- **Visualização**: Dashboard ProcessDetailsDashboard
- **Favoritos**: Salvar processos importantes com notas

### **3. Fluxo de Dados**

```
Usuário digita número
         ↓
Valida formato CNJ
         ↓
Chama searchDataJud() [já existe!]
         ↓
Retorna dados reais do tribunal
         ↓
Renderiza ProcessDetailsDashboard
         ↓
Usuário pode favoritar
```

### **4. Rota de Processos**
```
app/dashboard/processes/page.tsx  ← Página principal
components/processes/processes-search.tsx  ← Componente de busca
components/publications/process-details-dashboard.tsx  ← Exibição (já existe!)
```

---

## 🎯 Vantagens dessa Abordagem

✅ **Mesma lógica**: Interface familiar para usuário
✅ **Reutiliza componentes**: `ProcessDetailsDashboard` já existe
✅ **Dados reais**: Integra com API DataJud (já implementada)
✅ **Favoritos**: Mesmo sistema de leis
✅ **Consistência**: Look&feel igual às leis

---

## 📝 Comparativo

| Aspecto | Leis | Processos (Proposto) |
|---------|------|----------------------|
| Input | Nome/número/área | Número CNJ (20 dígitos) |
| Busca | Local (array) | API DataJud real |
| Resultados | Estáticos | Dinâmicos |
| Favoritos | ✅ Sim | ✅ Sim (reutilizar) |
| Visualização | iframe/external | ProcessDetailsDashboard |
| Movimentações | N/A | ✅ Timeline visual |

---

## 💡 Sugestão de Implementação

### Phase 1: Componente Simples
1. Criar `components/processes/processes-search.tsx`
2. Input para número do processo
3. Botão "Buscar"
4. Integrar com `searchDataJud()`
5. Mostrar resultados em `ProcessDetailsDashboard`

### Phase 2: Favoritos (Opcional)
1. Reutilizar API de favoritos para processos
2. Adicionar tabela `favorite_processes` no Supabase
3. Permitir salvar processos com notas

### Phase 3: Histórico
1. Listar últimas buscas
2. Mostrar processos mais visualizados
3. Busca rápida por número recente

---

## ⚠️ Questões a Considerar

1. **Permissões**: Um usuário pode ver qualquer processo ou apenas seus processos?
2. **Limite de buscas**: Há limite de requisições à API DataJud?
3. **Cache**: Guardar resultados recentes para performance?
4. **Notificações**: Alertar sobre novas movimentações?

---

## 🚀 Próximos Passos

Quer que eu:
1. ✅ Crie o componente `ProcessSearch` com a lógica?
2. ✅ Implemente a página `/dashboard/processes`?
3. ✅ Adicione favoritos para processos?
4. ✅ Crie tabela de histórico de buscas?

Qual você prefere começar?
