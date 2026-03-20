-- 048_enrich_and_expand_jurimetrics.sql

-- 1. CORRIGINDO E ENRIQUECENDO AS REGRAS ANTIGAS QUE ESTAVAM "POBRES" NA TELA
UPDATE public.offline_ai_rules 
SET 
    semantic_context = 'Decisão liminar inaudita altera parte deferindo a suspensão imediata de descontos em favor do autor.',
    legal_area = 'Direito do Consumidor',
    procedural_stage = 'Tutela de Urgência (Fase Inicial)',
    risk_level = 'baixo',
    urgency = true,
    deadline_days = 5,
    suggested_petition = 'Controle de Cumprimento de Liminar',
    financial_impact = 'médio'
WHERE category = 'Tutela de Urgência Deferida (Descontos)' AND procedural_stage IS NULL;

UPDATE public.offline_ai_rules 
SET 
    semantic_context = 'Sentença de procedência reconhecendo a ilegalidade da negativação nos órgãos de proteção ao crédito (SPC/Serasa).',
    legal_area = 'Direito do Consumidor/Cível',
    procedural_stage = 'Conhecimento (Sentença)',
    risk_level = 'baixo',
    deadline_days = 15,
    suggested_petition = 'Início de Cumprimento de Sentença (Obrigação de Fazer + Quantia Certa)',
    financial_impact = 'alto'
WHERE category = 'Negativação Indevida Procedente' AND procedural_stage IS NULL;

UPDATE public.offline_ai_rules
SET
    semantic_context = 'Decisão em cognição sumária determinando a consolidação da posse do bem em favor da instituição financeira.',
    legal_area = 'Direito Bancário',
    procedural_stage = 'Busca e Apreensão (Liminar)',
    urgency = true,
    deadline_days = 5,
    suggested_petition = 'Petição de Purgação da Mora ou Contestação',
    financial_impact = 'alto'
WHERE category = 'Busca e Apreensão (Liminar Deferida)' AND procedural_stage IS NULL;

-- 2. ADICIONANDO NOVAS REGRAS SUPER DETALHADAS E ROBUSTAS (Nível Enterprise)
INSERT INTO public.offline_ai_rules (rule_type, keywords, semantic_context, legal_area, procedural_stage, category, risk_level, probability_score, urgency, deadline_days, suggested_action, suggested_petition, financial_impact) VALUES

('sentence', ARRAY['impenhorabilidade', 'bem de família', 'improcedente', 'fraude à execução'], 'Afastamento da proteção ao bem de família por configuração de fraude', 'Direito Civil', 'Fase de Execução', 'Penhora de Bem de Família Mantida', 'crítico', 15, true, 15, 'Notificar cliente do risco iminente de leilão do imóvel residencial. Preparar recurso imediato.', 'Agravo de Instrumento com Efeito Suspensivo', 'crítico'),

('publication', ARRAY['leilão', 'hasta pública', 'intimação', 'datas designadas'], 'Imóvel, veículo ou maquinário prestes a ser alienado em leilão judicial', 'Direito Civil', 'Fase de Execução / Expropriação', 'Designação de Leilão / Praça', 'crítico', NULL, true, 5, 'Analisar nulidades de intimação (art. 889 CPC) ou defasagem da avaliação do perito. Tentar acordo emergencial.', 'Embargos à Arrematação / Petição de Nulidade', 'crítico'),

('sentence', ARRAY['revelia', 'presunção de veracidade', 'procedente em parte'], 'Demandado revel presente, mas magistrado não proveu integralmente os pleitos autorais', 'Direito Civil', 'Fase de Conhecimento', 'Procedência Parcial (Revelia)', 'médio', 80, false, 15, 'Liquidar os pedidos que foram julgados procedentes pelo Juízo. Analisar o proveito útil de interpor recurso para os indeferidos.', 'Recurso de Apelação (Tópicos Indeferidos)', 'médio'),

('sentence', ARRAY['justa causa', 'reversão', 'improcedente', 'abandono de emprego', 'desídia'], 'Manutenção da dispensa motivada (por justa causa) ditada pelo Juiz do Trabalho', 'Direito Trabalhista', 'Sentença Trabalhista', 'Justa Causa Mantida (Improcedente)', 'alto', 25, false, 8, 'Analisar robustez da prova documental da empresa confirmada em sentença. Chances de reversão no TRT reduzidas.', 'Recurso Ordinário Trabalhista', 'alto'),

('publication', ARRAY['alvará', 'expeça-se', 'transferência eletrônica', 'honorários sucumbenciais'], 'Liberação de valores retidos para a conta vinculada do processo/escritório', 'Direito Financeiro', 'Fase de Cumprimento', 'Expedição de Alvará (Honorários/Crédito)', 'baixo', 99, false, 5, 'Acompanhar crédito na conta do escritório. Informar cliente da liberação e prestar contas para eventual emissão de nota.', 'Acompanhamento de Restituição', 'alto'),

('sentence', ARRAY['benefício previdenciário', 'aposentadoria por invalidez', 'incapacidade permanente', 'procedente'], 'Concessão judicial de aposentadoria por incapacidade laborativa permanente pelo órgão previdenciário', 'Direito Previdenciário', 'Conhecimento (Mérito)', 'Concessão de Aposentadoria (Invalidez)', 'baixo', 95, false, 30, 'Requerer implantação imediata do benefício caso a Autarquia Previdenciária não o faça no prazo. Iniciar cálculos de RPV/Precatório dos retroativos.', 'Cumprimento de Obrigação de Fazer c/c Quantia Certa', 'alto'),

('sentence', ARRAY['guarda unilateral', 'alienação parental', 'estudo psicossocial', 'modificação'], 'Inversão da guarda ou suspensão de visitas baseada em laudo pericial de alienação parental', 'Direito de Família', 'Conhecimento (Mérito Familia)', 'Guarda Modificada (Alienação Parental)', 'crítico', 85, true, 15, 'Notificar cliente imediatamente da alteração de guarda fixada. Providenciar a busca e apreensão pacífica do menor se houver resistência.', 'Cumprimento de Mandado Liminar Familiar', 'baixo'),

('publication', ARRAY['homologo os cálculos', 'perito do juízo', 'intime-se para pagamento', '15 dias'], 'Juiz concordou expressamente com os cálculos de liquidação do exequente ou do perito avaliador', 'Direito Civil', 'Cumprimento de Sentença', 'Cálculos Homologados (Intimação para Pagar)', 'alto', NULL, true, 15, 'Obrigação iminente de depositar o importe vultoso em 15 dias sob pena de severa multa de 10% (Art. 523, CPC) e busca rápida via SISBAJUD.', 'Impugnação ao Cumprimento (Garantindo o Juízo prévio)', 'crítico'),

('sentence', ARRAY['prescrição intercorrente', 'extinção da execução', 'inércia do exequente'], 'Execução antiga fulminada por ausência de andamento útil ou localização de bens', 'Direito Civil / Tributário', 'Extinção da Execução', 'Prescrição Intercorrente Decretada', 'crítico', 10, false, 15, 'Avisar o cliente exequente sobre a perda judicial definitiva do crédito. Analisar minuciosamente se houve falha na intimação pessoal do credor antes da sentença.', 'Apelação (Focada em Nulidade de Intimação)', 'crítico');
