# 🔐 Configurar Usuário Admin

## ✅ E-mail Admin Configurado

O e-mail **iiicaramba@gmail.com** foi configurado como admin.

## 📝 Como Funciona

O sistema verifica se o usuário é admin de duas formas:

1. **Por E-mail:** Lista em `ADMIN_EMAILS` (variável de ambiente)
2. **Por User ID:** Lista em `ADMIN_USER_IDS` (variável de ambiente)
3. **Por Domínio:** E-mails terminando em `@themixa.com`

## 🔧 Configuração no Vercel

1. Acesse **Vercel Dashboard** → Seu Projeto → **Settings** → **Environment Variables**
2. Adicione ou edite:
   - **Key:** `ADMIN_EMAILS`
   - **Value:** `iiicaramba@gmail.com`
   - **Environments:** Production, Preview, Development
3. Clique em **Save**

## 🔧 Configuração Local (.env.local)

Crie ou edite o arquivo `.env.local` na raiz do projeto:

```env
ADMIN_EMAILS=iiicaramba@gmail.com
```

## ✅ Verificar

1. Faça login com `iiicaramba@gmail.com`
2. Acesse `/dashboard/metrics`
3. Deve funcionar! ✅

## 📝 Adicionar Mais Admins

Para adicionar mais admins, separe por vírgula:

```env
ADMIN_EMAILS=iiicaramba@gmail.com,outro@email.com,mais@email.com
```

Ou por User ID:

```env
ADMIN_USER_IDS=uuid-1,uuid-2,uuid-3
```

---

**Pronto!** O e-mail já está configurado no `env.example` e o código foi atualizado para aceitar e-mails. 🎉

