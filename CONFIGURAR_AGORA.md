# 🚀 Configurações Necessárias - Themixa

## ✅ O que foi implementado:

1. **Consulta de Leis Brasileiras** (`/dashboard/laws`)
   - Pesquisa e visualização de leis
   - 9 leis mais consultadas já cadastradas
   - Integração com Planalto.gov.br

2. **Sistema de Templates de Documentos** (`/dashboard/templates`)
   - Templates por área do direito
   - Preenchimento automático com placeholders
   - 5 templates do sistema já incluídos:
     - Procuração Ad Judicia
     - Contrato de Honorários
     - Ação de Indenização (Consumidor)
     - Divórcio Consensual
     - Reclamação Trabalhista

3. **Sistema de Papel Timbrado**
   - Upload de logo
   - Personalização de cores
   - Cabeçalho e rodapé customizáveis

4. **Correção do Redirecionamento Stripe**
   - Agora detecta automaticamente a URL do Vercel
   - Não precisa mais configurar manualmente

5. **Preços Atualizados**
   - Básico: R$ 89,00
   - Premium: R$ 174,99
   - Enterprise: R$ 260,00

---

## 🔧 Ações Necessárias no Supabase:

### 1. Execute os scripts SQL na ordem:

Vá em **Supabase Dashboard** > **SQL Editor** > **New Query** e execute:

#### Script 1: `scripts/009_verify_process_columns.sql`
- Verifica e adiciona as colunas necessárias na tabela `processes`
- **IMPORTANTE**: Execute este script PRIMEIRO para corrigir o erro 400 ao criar processos

#### Script 2: `scripts/010_create_templates_table.sql`
- Cria as tabelas `document_templates` e `letterheads`
- Configura RLS para segurança

#### Script 3: `scripts/011_insert_system_templates.sql`
- Insere os 5 templates do sistema
- **ATENÇÃO**: Antes de executar, você precisa substituir o UUID na primeira linha:
  ```sql
  system_user_id UUID := '00000000-0000-0000-0000-000000000000';
  ```
  Substitua pelo ID de um usuário admin real (pode ser o seu próprio ID de usuário)

### 2. Criar bucket de Storage para logos:

1. Vá em **Storage** no Supabase
2. Clique em **Create a new bucket**
3. Nome do bucket: `letterheads`
4. Marque como **Public** (para logos serem visíveis)
5. Clique em **Create bucket**

---

## 💳 Configurações do Stripe no Vercel:

### 1. Adicionar variável de ambiente:

No **Vercel Dashboard**:
- Settings > Environment Variables
- Adicione: `NEXT_PUBLIC_APP_URL` = `https://themixa.vercel.app`
- Environments: Production, Preview, Development
- Save

### 2. Atualizar preços no Stripe Dashboard:

1. Acesse: https://dashboard.stripe.com/products
2. Para cada produto (Básico, Premium, Enterprise):
   - Clique no produto
   - Clique em "Add another price"
   - Configure os novos valores:
     - Básico: R$ 89,00
     - Premium: R$ 174,99
     - Enterprise: R$ 260,00
   - Copie o novo Price ID
   - Atualize no Vercel (Environment Variables):
     - `NEXT_PUBLIC_STRIPE_PRICE_BASIC`
     - `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM`
     - `NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE`

---

## 📝 Como Usar:

### Consulta de Leis:
1. Acesse `/dashboard/laws`
2. Pesquise pelo nome ou número da lei
3. Clique em "Usar" para visualizar
4. Clique em "Abrir no Planalto" para o texto completo

### Templates de Documentos:
1. Acesse `/dashboard/templates`
2. Escolha um template da lista
3. Clique em "Usar"
4. Preencha os campos automáticos
5. Use "Auto-preencher" para dados de clientes cadastrados
6. Clique em "Exportar" para baixar o documento

### Criar Template Personalizado:
1. Em `/dashboard/templates`, clique em "Novo Template"
2. Defina nome, categoria e descrição
3. Escreva o conteúdo usando placeholders: `{{NOME_CAMPO}}`
4. Os placeholders serão detectados automaticamente
5. Salve e use!

### Papel Timbrado:
1. Acesse `/dashboard/templates` > aba "Papel Timbrado"
2. Clique em "Novo Papel Timbrado"
3. Faça upload do logo
4. Configure textos e cores
5. Marque como padrão se desejar
6. Salve

---

## ⚠️ Erro ao Criar Processo - SOLUÇÃO:

**O erro 400 acontece porque as novas colunas não existem no banco.**

### Solução Rápida:
1. Vá em Supabase > SQL Editor
2. Execute o script `scripts/009_verify_process_columns.sql`
3. Aguarde a confirmação
4. Tente criar um processo novamente

Isso adiciona as colunas:
- `polo` (ativo/passivo)
- `valor_causa` (valor da causa)
- `percentual_honorario` (% de honorários)
- `honorario_calculado` (calculado automaticamente)
- `status_ganho` (em andamento, ganho, perdido)

---

## 🎉 Próximos Passos:

Após executar os scripts e configurar o Stripe:

1. ✅ Crie um processo de teste com os novos campos
2. ✅ Teste a consulta de leis
3. ✅ Crie um template personalizado
4. ✅ Configure seu papel timbrado
5. ✅ Teste o pagamento com Stripe

---

## 📞 Suporte:

Se tiver algum erro ao executar os scripts, me envie o erro exato e eu te ajudo!









