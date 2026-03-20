-- Seed: Perguntas sobre USO DO SISTEMA (funcionalidades, navegação, como fazer X)
-- Execute este script no Painel SQL do Supabase.

INSERT INTO public.bot_knowledge (question, answer, is_active) VALUES

-- USO GERAL DO SISTEMA
('como usar o sistema, como funciona o sistema, como usar a plataforma, como usar a themixa, tutorial, como comecar, primeiros passos, por onde comecar, ajuda para usar, iniciante, novo usuario, como funciona',
'Bem-vindo(a) à Themixa! 🎉 Aqui vai um guia rápido para você começar:\n\n1. **Processos** → Importe seus processos judiciais pelo DataJud em segundos.\n2. **Clientes** → Cadastre e gerencie todos os seus clientes e contatos.\n3. **Prazos** → Controle todos os prazos processuais com alertas automáticos.\n4. **Financeiro** → Acompanhe receitas, despesas e honorários.\n5. **Timesheet** → Registre suas horas trabalhadas por cliente/processo.\n\nTudo fica acessível pelo menu lateral esquerdo. Comece importando um processo ou cadastrando um cliente!', true),

-- IMPORTAÇÃO DE PROCESSOS
('como importar processo, importar processo, importacao, datajud, puxar processo, buscar processo, cadastrar processo, numero cnj, como adicionar processo, novo processo',
'Para importar um processo é super fácil! 📋\n\n1. Clique em **Processos** no menu lateral.\n2. Clique no botão **Nova Importação**.\n3. Digite o **número do CNJ** do processo.\n4. Em menos de 10 segundos, todas as movimentações, tribunal e vara serão puxados automaticamente do DataJud!\n\nVocê pode importar vários processos de uma vez. Todos ficam organizados na sua lista de processos.', true),

-- TIMESHEET / HONORÁRIOS
('como calcular honorarios, honorarios, timesheet, horas trabalhadas, registrar horas, cobrar cliente, faturamento, como faturar, valor hora, cobranca',
'Para calcular e faturar seus honorários na Themixa: 💰\n\n1. Vá em **Timesheet** no menu lateral.\n2. Clique em **Novo Registro** para adicionar horas trabalhadas.\n3. Selecione o **cliente** e o **processo** relacionado.\n4. Informe a **duração** e a **descrição** da atividade.\n5. O sistema calcula automaticamente o valor com base no seu valor/hora configurado.\n\nDepois, você pode gerar relatórios de faturamento para enviar aos clientes!', true),

-- PRAZOS
('como cadastrar prazo, prazos, controle de prazos, prazo fatal, alerta de prazo, lembrete, vencimento, agenda, calendario, deadline',
'Para gerenciar seus prazos processuais: ⏰\n\n1. Acesse **Prazos** no menu lateral.\n2. Clique em **Novo Prazo** para cadastrar.\n3. Vincule ao **processo** e defina a **data limite**.\n4. O sistema enviará **alertas automáticos** antes do vencimento!\n\nVocê também pode visualizar tudo no **Calendário** para ter uma visão geral da sua agenda. Nunca mais perca um prazo fatal!', true),

-- CLIENTES
('como cadastrar cliente, cadastrar cliente, novo cliente, gerenciar clientes, lista de clientes, adicionar cliente, contato cliente',
'Para cadastrar um novo cliente: 👤\n\n1. Vá em **Clientes** no menu lateral.\n2. Clique em **Novo Cliente**.\n3. Preencha os dados: nome, CPF/CNPJ, telefone, e-mail, endereço.\n4. Pronto! O cliente já estará disponível para vincular a processos e timesheets.\n\nVocê pode gerenciar todos os dados e histórico de cada cliente em um só lugar.', true),

-- FINANCEIRO
('financeiro, controle financeiro, receitas, despesas, fluxo de caixa, contas a pagar, contas a receber, dinheiro, pagamento, alvara',
'O módulo **Financeiro** é o coração da gestão do seu escritório! 💳\n\n1. Acesse **Financeiro** no menu lateral.\n2. Registre **receitas** (honorários, alvarás, etc.) e **despesas** (custas, taxas, etc.).\n3. Acompanhe o **fluxo de caixa** em tempo real.\n4. Visualize relatórios e gráficos da saúde financeira do escritório.\n\nDica: Vincule as movimentações financeiras aos processos para ter rastreabilidade completa!', true),

-- SUPORTE
('suporte, telefone suporte, contato suporte, ajuda tecnica, falar com humano, atendimento, whatsapp suporte, preciso de ajuda, problema tecnico, bug, erro',
'Precisa falar com nosso time de suporte humano? 📱\n\nEntre em contato pelo WhatsApp:\n• **(11) 95582-1293**\n• **(71) 99137-3142**\n\nNosso time está disponível em horário comercial para te ajudar com qualquer questão técnica, dúvida ou sugestão. Estamos prontos para resolver!', true),

-- CONFIGURAÇÕES
('configuracoes, configurar, ajustes, preferencias, perfil, minha conta, alterar senha, mudar senha, personalizar, tema',
'Para acessar as configurações do sistema: ⚙️\n\n1. Clique em **Configurações** no menu lateral (ícone de engrenagem).\n2. Lá você pode:\n   - Editar seu **perfil** e foto.\n   - Alterar sua **senha**.\n   - Configurar **preferências** do sistema.\n   - Gerenciar **notificações** e alertas.\n\nPersonalize a Themixa do seu jeito!', true),

-- DASHBOARD
('dashboard, painel, visao geral, resumo, indicadores, metricas, grafico, estatisticas, relatorio, como ver meus numeros',
'O **Dashboard** é sua página inicial e mostra um resumo completo do escritório: 📊\n\n• **Processos ativos** e suas movimentações recentes.\n• **Prazos próximos** que precisam de atenção.\n• **Indicadores financeiros** (receita, despesas, saldo).\n• **Gráficos** de desempenho e produtividade.\n\nÉ a primeira tela que aparece quando você acessa o sistema. Use-a para ter uma visão rápida de tudo que está acontecendo!', true)

ON CONFLICT DO NOTHING;
