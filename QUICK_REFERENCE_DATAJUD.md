# 🎯 Referência Rápida: API DataJud Robusta

## 📍 Arquivo Principal
**`app/api/jusbrasil/search/route.ts`** - Completamente reescrito com 5 regras técnicas

## ✅ 5 Regras Implementadas

| # | Regra | Implementação | Benefício |
|---|-------|-----------------|-----------|
| 1 | **Timeout Controlado** | `AbortController` (8s) | Evita erro 504 na Vercel |
| 2 | **Validação de Resposta** | 3 camadas (status, content-type, JSON) | Detecta HTML de erro |
| 3 | **API Key Pública** | `cDzFyJWE9nGPRnWE949n95989R939n929r98` | Sem auth extra |
| 4 | **Query Preciso** | ElasticSearch `match_phrase` | Menos falsos positivos |
| 5 | **Erros Inteligentes** | Retorna 503, não 500 | Mensagens claras ao usuário |

## 🚀 Quick Start

### Cliente
```typescript
const res = await fetch('/api/jusbrasil/search', {
  method: 'POST',
  body: JSON.stringify({ processNumber: '12345678901234567890' })
})

if (res.ok) {
  const { data } = await res.json()
  // data = array de movimentações
} else if (res.status === 503) {
  toast.error('Sistema do tribunal indisponível')
}
```

### Resposta (200 OK)
```json
{
  "success": true,
  "processNumber": "12345678901234567890",
  "results": 5,
  "saved": 5,
  "data": [
    {
      "data": "2025-01-08",
      "descricao": "Sentença proferida",
      "tipo": "Sentença",
      "diario": "Diário de Justiça",
      "processo_titulo": "Ação Ordinária"
    }
  ]
}
```

### Resposta (503 - Indisponível)
```json
{
  "error": "O sistema do tribunal está instável no momento. Tente novamente em instantes.",
  "code": "SERVICE_UNAVAILABLE"
}
```

## 🔍 Casos de Erro Tratados

| Cenário | Detecção | Resposta |
|---------|----------|----------|
| Timeout > 8s | `AbortError` | 503 |
| Governo retorna HTML | `text.includes('<!DOCTYPE')` | 503 |
| Content-Type não JSON | `!contentType.includes('json')` | 503 |
| JSON parse fail | `catch (parseError)` | 503 |
| ECONNREFUSED | `error.message.includes('connection')` | 503 |
| Número inválido | `cleaned.length !== 20` | 400 |
| Não autenticado | `!user` | 401 |

## 📊 Tribunais Suportados

Todos os 40 tribunais brasileiros:
- STF, STJ, TST, TNU
- TRF1-6 (Tribunais Regionais Federais)
- TJ + 2 letras (todos os estados)
- Tribunal Militar

Código tribunal extraído automaticamente do número CNJ (posição 15-16).

## ⏱️ Tempo de Resposta Esperado

| Cenário | Tempo | Nota |
|---------|-------|------|
| API rápido | 200-500ms | Normal |
| API médio | 500ms-2s | Aceitável |
| API lento | 2-8s | Aguarda até 8s |
| Timeout | 8s + 503 | Aborta graciosamente |

## 🛠️ Debug

### Logs na Console
```
[DataJud] Buscando em https://api-publica.datajud.cnj.jus.br/tjba/_search para 12345678901234567890
[DataJud] ✅ 5 resultados encontrados para 12345678901234567890
[DataJud Search Error]: AbortError
[DataJud] Content-Type inválido: text/html
```

### Testar Localmente
```bash
curl -X POST http://localhost:3000/api/jusbrasil/search \
  -H "Content-Type: application/json" \
  -d '{"processNumber":"12345678901234567890"}'
```

## 📚 Documentação Completa

- `INTEGRACAO_DATAJUD_ROBUSTA.md` - Detalhes técnicos completos
- `README_DATAJUD_API.md` - Visão geral
- `test-datajud-api.js` - Script para testar

## ✨ Características

✅ Timeout inteligente (8s)  
✅ Validação em 3 camadas  
✅ Detecta HTML de erro  
✅ 40 tribunais suportados  
✅ Fallback para movimentações  
✅ RLS no Supabase  
✅ Histórico de buscas  
✅ Deduplicação automática  
✅ Mensagens em português  
✅ Pronto para produção

## 🎉 Status

**IMPLEMENTADO E PRONTO PARA PRODUÇÃO** 🚀

Deploy em produção seguro!
