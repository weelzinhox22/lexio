# 🔑 Erro "Invalid API key" - Solução

## ⚠️ Problema

Ao tentar cadastrar uma conta, aparece o erro: **"Invalid API key"**

## ✅ Soluções

### 1. Reinicie o Servidor de Desenvolvimento

**IMPORTANTE:** Após atualizar o arquivo `.env.local`, você **DEVE** reiniciar o servidor!

```bash
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

O Next.js só carrega as variáveis de ambiente quando o servidor inicia. Se você atualizou o `.env.local` sem reiniciar, as variáveis antigas ainda estão em memória.

---

### 2. Verifique se a Chave Está Correta

A chave anon deve ser exatamente:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbGpwcGx6c3pleXBzanhkc3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3ODIyOTIsImV4cCI6MjA4MzM1ODI5Mn0.VuY1YVwLyqeyY4kKFc5UZbqbmDk5V1CXgSRWpSiyGiI
```

**Verifique:**
- ✅ Não há espaços antes ou depois da chave
- ✅ Não há quebras de linha no meio da chave
- ✅ A chave está completa (deve ter ~238 caracteres)

---

### 3. Limpe o Cache do Navegador

1. Pressione `Ctrl + Shift + Delete`
2. Selecione "Cache" e "Cookies"
3. Limpe os dados
4. Recarregue a página (`Ctrl + F5`)

---

### 4. Verifique no Console do Navegador

1. Abra o DevTools (`F12`)
2. Vá na aba **Console**
3. Procure por erros relacionados ao Supabase
4. Verifique se a URL e chave estão sendo carregadas corretamente

---

### 5. Verifique no Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/jjljpplzszeypsjxdsxy/settings/api
2. Confirme que a **anon public** key é exatamente a mesma do `.env.local`
3. Se for diferente, atualize o `.env.local` e reinicie o servidor

---

## 🔍 Debug

Para verificar se as variáveis estão sendo carregadas:

1. Adicione temporariamente no código (apenas para debug):
```typescript
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
```

2. Verifique no console do navegador se os valores estão corretos

3. **Remova o console.log após verificar!**

---

## ✅ Checklist

- [ ] Reiniciei o servidor após atualizar `.env.local`
- [ ] A chave não tem espaços ou quebras de linha
- [ ] A chave está completa (238 caracteres)
- [ ] A URL está correta: `https://jjljpplzszeypsjxdsxy.supabase.co`
- [ ] Limpei o cache do navegador
- [ ] Verifiquei no Supabase Dashboard que a chave está correta

---

## 🚨 Se Ainda Não Funcionar

1. **Delete o arquivo `.env.local`**
2. **Crie novamente** copiando do `env.example`
3. **Cole as credenciais corretas** (sem espaços extras)
4. **Salve o arquivo**
5. **Reinicie o servidor**

---

## 📝 Formato Correto do .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://jjljpplzszeypsjxdsxy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbGpwcGx6c3pleXBzanhkc3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3ODIyOTIsImV4cCI6MjA4MzM1ODI5Mn0.VuY1YVwLyqeyY4kKFc5UZbqbmDk5V1CXgSRWpSiyGiI
```

**Importante:** Cada variável em uma linha, sem espaços antes ou depois do `=`, sem quebras de linha no meio dos valores.

