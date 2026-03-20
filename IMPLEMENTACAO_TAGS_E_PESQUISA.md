# Implementação: Tags de Processos + Pesquisa Global

## 📋 Resumo

Foram implementadas 2 grandes funcionalidades:

1. **Sistema de Etiquetas (Tags) para Processos** - 11 categorias com cores únicas
2. **Barra de Pesquisa Global Integrada** - Pesquisa em processos, contatos, tarefas e publicações

---

## 🏷️ 1. Sistema de Tags (Etiquetas)

### Localização
- **Configuração**: [lib/constants/process-tags.ts](lib/constants/process-tags.ts)
- **Componente Seletor**: [components/processes/tag-selector.tsx](components/processes/tag-selector.tsx)

### 11 Etiquetas Disponíveis

| Tag | Cor | Descrição |
|-----|-----|-----------|
| **Consumidor** | 🔴 Vermelho | Direito do Consumidor |
| **Criminal** | 🔴 Vermelho Escuro | Processo Criminal |
| **Cível** | 🔵 Azul | Processo Cível |
| **Fase Audiência** | 🟣 Roxo | Fase de Audiência |
| **Fase Citação** | 🟡 Amarelo | Fase de Citação |
| **Fase Conciliação** | 🟢 Verde | Fase de Conciliação |
| **Fase Contestação** | 🟠 Laranja | Fase de Contestação |
| **Fase Inicial** | 🟦 Índigo | Fase Inicial |
| **Fase Sentença** | 🩷 Rosa | Fase de Sentença |
| **Trabalhista** | 🔷 Ciano | Processo Trabalhista |
| **Tributário** | 🟩 Esmeralda | Processo Tributário |

### Características

#### Seletor de Tags
- **Botão Dropdown**: "Etiquetas (X)" mostrando quantidade selecionada
- **Menu com Listagem**: Scroll automático com 11 tags
- **Visual Preview**: Círculo colorido + descrição para cada tag
- **Seleção Múltipla**: Selecionar várias tags simultaneamente
- **Display de Selecionadas**: Badges com cores individuais
- **Remover Individual**: Clique no badge para remover
- **Limpar Tudo**: Botão X para remover todas as tags

#### Cores Configuráveis
Cada tag tem 4 propriedades de cor:
- `color`: Cor do ponto (ex: `bg-red-500`)
- `bgColor`: Fundo claro (ex: `bg-red-50`)
- `borderColor`: Cor da borda (ex: `border-red-300`)
- `textColor`: Cor do texto (ex: `text-red-700`)

### Integração em Processos
- **Localização**: Seção de busca em `/dashboard/processes`
- **Posição**: Abaixo do campo de entrada do número CNJ
- **Acima do botão**: "Buscar"
- **Estado Local**: Tags selecionadas mantidas em estado React
- **Persistência**: Pronta para salvar em banco (quando integrada)

---

## 🔍 2. Barra de Pesquisa Global

### Localização
- **Componente**: [components/navigation/global-search.tsx](components/navigation/global-search.tsx)
- **Endpoint API**: [app/api/search/route.ts](app/api/search/route.ts)
- **Integração**: Header da Dashboard ([components/dashboard/header.tsx](components/dashboard/header.tsx))

### Características

#### Interfaceℹ️ Visual
- **Botão de Ativação**: Barra na header com ícone 🔍
- **Placeholder**: "Pesquisar processos, contatos ou tarefas..."
- **Atalho de Teclado**: ⌘K (exibido como dica)
- **Responsivo**: Adapta-se a mobile e desktop

#### Funcionalidades
- **Busca em Tempo Real**: Digita 2+ caracteres → resultados aparecem
- **Debounce**: Aguarda 300ms de pausa antes de buscar
- **Agrupamento**: Resultados organizados por tipo
- **Ícones**: Cada tipo tem ícone colorido
  - 📋 Processo (Azul)
  - 👥 Contato (Verde)
  - ✓ Tarefa (Laranja)
  - 📄 Publicação (Roxo)

#### Tipos de Busca

1. **Processos**
   - Busca em: `title`, `process_number`
   - Link: `/dashboard/processes/[id]`
   - Ícone: Pasta

2. **Contatos (Clientes)**
   - Busca em: `name`, `email`
   - Link: `/dashboard/clients/[id]`
   - Ícone: Pessoas

3. **Tarefas (Deadlines)**
   - Busca em: `title`
   - Link: `/dashboard/deadlines/[id]`
   - Ícone: Checkbox

4. **Publicações**
   - Busca em: `process_title`, `process_number`
   - Link: `/dashboard/publications/[id]`
   - Ícone: Documento

#### Comportamento
- **Sem Busca**: Mensagem "Digite para pesquisar"
- **Buscando**: Spinner de carregamento
- **Sem Resultados**: "Nenhum resultado encontrado para..."
- **Com Resultados**: Listagem agrupada por tipo
- **Click em Resultado**: Redireciona e fecha o modal

### API de Pesquisa

#### Endpoint
```
GET /api/search?q=termo
```

#### Response
```json
{
  "results": [
    {
      "id": "uuid",
      "title": "Nome do Item",
      "subtitle": "Informação Adicional",
      "type": "process|contact|task|publication",
      "href": "/dashboard/path/to/item"
    }
  ]
}
```

#### Filtros Aplicados
- Busca limitada ao usuário autenticado (`user_id`)
- Limite de 5 resultados por tipo
- Case-insensitive (ILIKE)
- Busca em múltiplos campos

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
- ✅ [lib/constants/process-tags.ts](lib/constants/process-tags.ts) - Configuração de tags
- ✅ [components/processes/tag-selector.tsx](components/processes/tag-selector.tsx) - Seletor de tags
- ✅ [components/navigation/global-search.tsx](components/navigation/global-search.tsx) - Barra de pesquisa
- ✅ [components/ui/command.tsx](components/ui/command.tsx) - Componente Command (cmdk)
- ✅ [components/ui/popover.tsx](components/ui/popover.tsx) - Componente Popover
- ✅ [app/api/search/route.ts](app/api/search/route.ts) - API de pesquisa

### Arquivos Modificados
- ✅ [components/processes/processes-search.tsx](components/processes/processes-search.tsx) - Adicionar tag selector
- ✅ [components/dashboard/header.tsx](components/dashboard/header.tsx) - Integrar pesquisa global

---

## 🎨 Design Visual

### Tag Selector
```
┌─────────────────────────────────────────┐
│ 🏷️  Etiquetas (3)           ✕           │
├─────────────────────────────────────────┤
│ Selecionadas:                           │
│ [🔴 Consumidor] [🟢 Conciliação] ...   │
└─────────────────────────────────────────┘

Menu Dropdown:
┌─────────────────────────────────────────┐
│ ● Consumidor          Direito Consumidor│
│ ● Criminal           Processo Criminal  │
│ ● Cível              Processo Cível     │
│ ✓ Fase Audiência     [Selecionado]      │
│ ... (11 total)                          │
└─────────────────────────────────────────┘
```

### Global Search
```
Header: [🔍 Pesquisar processos... ⌘K]

Popover:
┌──────────────────────────────────────┐
│ [🔍 Pesquisar processos...]          │
├──────────────────────────────────────┤
│ 📦 PROCESSOS                         │
│   📋 Processo XYZ 0000000-00.0000... │
│   📋 Outro Processo 1111111-11.1111..│
│                                      │
│ 👥 CONTATOS                          │
│   👤 João Silva  joao@example.com    │
│                                      │
│ ✓ TAREFAS                            │
│   ☑ Revisar Contrato 2025-01-15      │
│                                      │
│ 📄 PUBLICAÇÕES                       │
│   📰 Publicação 1 2222222-22.2222...  │
└──────────────────────────────────────┘
```

---

## 🧪 Como Usar

### 1. Selecionar Tags em Processos

**Localização**: `/dashboard/processes`

**Passos:**
1. Ir para seção "Buscar Processo"
2. Clique em "Etiquetas (0)" dropdown
3. Selecione as tags desejadas
4. Veja as badges aparecerem abaixo
5. Clique em uma badge para remover ou clique X para limpar tudo

### 2. Usar Pesquisa Global

**Localização**: Header da Dashboard (em qualquer página `/dashboard/*`)

**Passos:**
1. Clique na barra "Pesquisar processos..."
2. Digite 2+ caracteres
3. Veja resultados agrupados por tipo
4. Clique em um resultado para ir para a página

**Atalho de Teclado**: ⌘K (Mac/Linux) ou Ctrl+K (Windows)

---

## 🗄️ Banco de Dados (Preparado para)

As tags podem ser salvas na tabela `processes`:
```sql
ALTER TABLE processes ADD COLUMN tags ProcessTag[] DEFAULT '{}';
```

Exemplo:
```sql
UPDATE processes 
SET tags = ARRAY['consumidor', 'fase-conciliacao']
WHERE id = 'uuid';
```

---

## ✅ Checklist de Implementação

- ✅ 11 tags criadas com cores únicas
- ✅ Componente seletor de tags funcional
- ✅ Seleção múltipla e remoção de tags
- ✅ Integrado em `/dashboard/processes`
- ✅ Barra de pesquisa global criada
- ✅ API de pesquisa implementada
- ✅ Busca em 4 tipos (processo, contato, tarefa, publicação)
- ✅ Agrupamento de resultados por tipo
- ✅ Componentes UI (Command, Popover) criados
- ✅ Integrado na header da dashboard
- ✅ Build passa sem erros
- ✅ Pronto para produção

---

## 🚀 Próximos Passos (Opcional)

1. **Persistência de Tags**: Salvar tags selecionadas em banco de dados
2. **Filtro por Tags**: Adicionar filtro para pesquisar processos por tags
3. **Gestos de Teclado**: Navegar resultados com setas + Enter
4. **Histórico de Buscas**: Mostrar buscas recentes quando vazio
5. **Favoritos Rápidos**: Adicionar atalhos para itens mais acessados
6. **Analytics**: Rastrear tags e buscas mais usadas

