-- 046_massive_offline_jurimetrics_expansion.sql
-- Expansão massiva da base de conhecimentos offline para triagem e jurimetria.
-- Este script adiciona dezenas de cenários comuns na justiça brasileira, cobrindo cível, família, consumidor, trabalhista e criminal.

-- ==========================================================
-- DIREITO DO CONSUMIDOR / CÍVEL MASSIVO
-- ==========================================================

INSERT INTO public.offline_ai_rules (rule_type, keywords, category, suggested_action, probability_score, priority_level) VALUES
('sentence', ARRAY['negativação', 'spc', 'serasa', 'indevida', 'dano moral', 'procedente'], 'Negativação Indevida Procedente', 'Iniciar Liquidação/Cumprimento de Sentença (Obrigação de fazer + Pagar)', 98, 'urgent'),
('sentence', ARRAY['negativação', 'exercício regular', 'inadimplência', 'improcedente'], 'Negativação - Exercício Regular (Improcedente)', 'Analisar possibilidade de recurso verificando se a dívida foi de fato prescrita ou tentar acordo', 35, 'high'),
('sentence', ARRAY['bagagem', 'extravio', 'voo', 'atraso', 'dano moral'], 'Atraso/Extravio Voo Procedente', 'Cobrar pagamento de danos materiais e morais da cia aérea', 90, 'medium'),
('sentence', ARRAY['plano de saúde', 'home care', 'negativa', 'cobertura', 'rol da ans'], 'Plano de Saúde - Cobertura Deferida', 'Acompanhar deferimento liminar/sentença. Risco da operadora não cumprir: pedir astreintes urgentes.', 95, 'urgent'),
('sentence', ARRAY['busca e apreensão', 'veículo', 'purgação da mora', 'liminar deferida'], 'Busca e Apreensão (Liminar Deferida)', 'Contatar cliente com urgência. Prazo curtíssimo de 5 dias para pagamento integral ou apresentar contestação.', 90, 'urgent'),

('publication', ARRAY['leilão', 'designadas datas', 'praça', 'arrematação'], 'Designação de Leilão', 'Aviso URGENTE ao cliente e verificar protocolo de embargos de arrematação ou suspensão.', NULL, 'urgent'),
('publication', ARRAY['penhora', 'bacenjud', 'sisbajud', 'bloqueio', 'desbloqueio', 'intimação'], 'Bloqueio Judicial', 'Apresentar manifestação sobre penhora ou embargos à execução (ex: impenhorabilidade)', NULL, 'urgent');

-- ==========================================================
-- DIREITO DO TRABALHO
-- ==========================================================

INSERT INTO public.offline_ai_rules (rule_type, keywords, category, suggested_action, probability_score, priority_level) VALUES
('sentence', ARRAY['horas extras', 'cartão de ponto', 'súmula 338', 'procedente'], 'Horas Extras Deferidas', 'Aguardar trânsito ou protocolar cálculos de liquidação das horas e reflexos.', 85, 'high'),
('sentence', ARRAY['vínculo empregatício', 'reconhecido', 'ctps', 'subordinação'], 'Vínculo Empregatício Reconhecido', 'Risco da Reclamada recorrer por Recurso Ordinário. Iniciar preparos.', 75, 'medium'),
('sentence', ARRAY['dano existencial', 'jornada exaustiva', 'improcedente'], 'Dano Existencial Trabalhista Afastado', 'Preparar Recurso Ordinário batendo em prova de impacto na vida social/pessoal do Reclamante.', 40, 'medium'),

('publication', ARRAY['perícia médica', 'designada', 'insalubridade', 'periculosidade'], 'Agendamento de Perícia', 'Confirmar presença de assistente técnico e notificar cliente da data via WhatsApp/Email.', NULL, 'high'),
('publication', ARRAY['audiência', 'instrução', 'designada', 'testemunhas'], 'Audiência de Instrução', 'Convocar testemunhas e preparar rol de perguntas do cliente. Prazo em andamento.', NULL, 'urgent');

-- ==========================================================
-- DIREITO DE FAMÍLIA E SUCESSÕES
-- ==========================================================

INSERT INTO public.offline_ai_rules (rule_type, keywords, category, suggested_action, probability_score, priority_level) VALUES
('sentence', ARRAY['alimentos', 'percentual', 'salário mínimo', 'fixo', 'procedente'], 'Fixação de Alimentos (Procedente)', 'Verificar ofício de implantação de desconto em folha e notificar partes.', 90, 'high'),
('sentence', ARRAY['guarda', 'compartilhada', 'princípio', 'melhor interesse'], 'Guarda Compartilhada Fixada', 'Analisar e ajustar regime de convivência se aplicável no trânsito em julgado.', 95, 'medium'),
('sentence', ARRAY['inventário', 'partilha', 'homologo', 'formal de partilha'], 'Homologação de Partilha', 'Requerer expedição do Formal de Partilha e guias de ITCMD.', 99, 'high'),

('publication', ARRAY['estudo psicossocial', 'entrevista', 'assistente social'], 'Estudo Psicossocial Designado', 'Avisar o cliente da entrevista psicológica/social presencial urgente.', NULL, 'urgent');

-- ==========================================================
-- CONTEÚDO PROCESSUAL GENÉRICO / TRIBUNAIS (DESPACHOS COMUNS)
-- ==========================================================

INSERT INTO public.offline_ai_rules (rule_type, keywords, category, suggested_action, probability_score, priority_level) VALUES
('publication', ARRAY['especifiquem provas', 'produzir provas', 'julgamento antecipado'], 'Intimação: Especificar Provas', 'Protocolar petição especificando provas rol testemunhal, perícia ou depoimento pessoal - 5 dias úteis.', NULL, 'high'),
('publication', ARRAY['contrarrazões', 'apresentação', 'recurso inominado', 'apelação', '15 dias'], 'Intimação para Contrarrazões', 'Redigir Contrarrazões ao recurso da parte contrária em até 15 dias (ou prazos do JEC).', NULL, 'urgent'),
('publication', ARRAY['impugnação', 'contestação', 'réplica'], 'Intimação para Réplica', 'Criar tarefa pendente de Réplica à Contestação. Atentar a preliminares trazidas pela defesa.', NULL, 'high'),
('publication', ARRAY['expedição de alvará', 'expeça-se alvará', 'levantamento'], 'Alvará Deferido', 'Solicitar transferência do RPV/Alvará, notificar cliente do recebimento com o recibo de honorários', NULL, 'urgent'),
('publication', ARRAY['mandado de citação', 'citada', 'mandado de intimação', 'ar'], 'AR ou Mandado Juntado', 'Atenção ao começo de decurso de prazo. Conferir datas da juntada do AR.', NULL, 'medium'),
('publication', ARRAY['emende-se a inicial', 'emenda', '15 dias', 'comprovante de residência', 'procuração'], 'Determinação de Emenda à Inicial', 'Juntar os documentos faltantes apontados pelo juízo sob pena de extinção. Urgente (15 dias)!', NULL, 'urgent');

-- ==========================================================
-- DIREITO PENAL
-- ==========================================================

INSERT INTO public.offline_ai_rules (rule_type, keywords, category, suggested_action, probability_score, priority_level) VALUES
('publication', ARRAY['cabe ao ministério público', 'diligências', 'vista ao mp'], 'Vista ao Ministério Público', 'Aguardar manifestação ou denúncia do Promotor. Nenhuma ação requerida da defesa no momento.', NULL, 'low'),
('publication', ARRAY['defesa prévia', 'resposta à acusação', 'art. 396-a'], 'Intimação: Resposta à Acusação', 'Apresentar Resposta à Acusação c/ rol de testemunhas no prazo fatal.', NULL, 'urgent'),
('sentence', ARRAY['absolvição', 'fragilidade probatória', 'in dubio pro reo'], 'Sentença Absolutória', 'Aguardar trânsito em julgado para comunicar o cliente e pedir baixa na distribuição.', 90, 'high');

-- ==========================================================
-- JURIMETRIA AVANÇADA / ANÁLISE DE RISCO RECURSAL
-- ==========================================================

INSERT INTO public.offline_ai_rules (rule_type, keywords, category, suggested_action, probability_score, priority_level) VALUES
-- Análise de Sentença com Tese de Recurso
('sentence', ARRAY['sucumbência recíproca', 'honorários', 'proporcionalidade'], 'Sentença: Sucumbência Parcial', 'Analisar base de cálculo dos honorários. Se fixado sobre o valor da causa e não sobre o proveito econômico, cabe ED ou Recurso.', 70, 'high'),
('sentence', ARRAY['ilegitimidade passiva', 'extinto sem resolução', 'art. 485', 'extinção'], 'Extinção sem Mérito (Ilegitimidade)', 'Probabilidade de reversão baixa se a prova documental estiver ausente. Sugerir nova ação corrigindo o polo passivo.', 20, 'high'),
('sentence', ARRAY['cerceamento de defesa', 'indeferimento de prova', 'testemunha'], 'Cerceamento de Defesa Detectado', 'Tese Recursal: Preliminar de nulidade da sentença por cerceamento de defesa. Chance de anulação alta em tribunais superiores.', 85, 'urgent'),
('sentence', ARRAY['dano moral', 'quantum', 'razoabilidade', 'proporcionalidade'], 'Dano Moral - Valor Baixo', 'Jurimetria indica média superior para casos análogos. Sugerir recurso para majoração do valor (Pedido de Majoração).', 60, 'medium'),

-- ==========================================================
-- EXTRAÇÃO DE DADOS DE PUBLICAÇÕES (Gatilhos Financeiros e Prazos)
-- ==========================================================

('publication', ARRAY['custas processuais', 'guia', 'preparo', 'recolhimento', 'deserção'], 'Financeiro: Pagamento de Custas', 'Detectado comando de pagamento. Criar lembrete financeiro para emissão de guia sob pena de deserção/extinção.', NULL, 'urgent'),
('publication', ARRAY['perito', 'honorários periciais', 'estimativa', 'depositar'], 'Financeiro: Honorários do Perito', 'O juiz fixou honorários periciais. Notificar cliente para depósito ou impugnar valor se exorbitante.', NULL, 'high'),
('publication', ARRAY['multa diária', 'astreintes', 'descumprimento'], 'Risco: Incidência de Multa', 'URGENTE: O juiz fixou ou executou multa diária. Verificar cumprimento imediato da obrigação de fazer.', NULL, 'urgent'),

-- ==========================================================
-- DIREITO BANCÁRIO / REVISIONAL (Volume Massivo)
-- ==========================================================

('sentence', ARRAY['tabela price', 'anatocismo', 'capitalização', 'juros'], 'Revisional: Juros Abusivos', 'Analisar se a taxa contratada está acima da taxa média do BACEN para o período. Chance média de provimento.', 50, 'medium'),
('sentence', ARRAY['tarifa de cadastro', 'seguro', 'venda casada'], 'Revisional: Vendas Casadas', 'Tese consolidada no STJ. Procedência alta para devolução de valores de seguros não solicitados.', 90, 'high'),

-- ==========================================================
-- JEC / TURMA RECURSAL (Rito Sumaríssimo)
-- ==========================================================

('publication', ARRAY['recurso inominado', 'tempestivo', 'efeito devolutivo'], 'JEC: Recurso Inominado Interposto', 'Prazo de 10 dias para contrarrazões. Atenção: no JEC o preparo deve ser feito em 48h após o recurso.', NULL, 'urgent'),
('sentence', ARRAY['embargos de declaração', 'omissão', 'contradição', 'obscuridade'], 'Decisão em Embargos', 'Verificar se houve efeito infringente (mudança da sentença). Se sim, abre-se novo prazo recursal.', 95, 'high'),

-- ==========================================================
-- AGRAVO DE INSTRUMENTO / TUTELAS
-- ==========================================================

('publication', ARRAY['efeito suspensivo', 'concedo', 'agravante', 'liminarmente'], 'Agravo: Efeito Suspensivo Deferido', 'A decisão anterior está pausada. Notificar cliente que a urgência foi atendida/bloqueada.', NULL, 'urgent'),

('publication', ARRAY['contraminuta', 'agravo de instrumento'], 'Intimação: Contraminuta', 'Apresentar defesa contra o recurso da parte contrária no Tribunal (2ª instância).', NULL, 'high');

INSERT INTO public.offline_ai_rules 
(rule_type, keywords, semantic_context, legal_area, procedural_stage, category, risk_level, probability_score, urgency, deadline_days, suggested_action, suggested_petition, financial_impact)
VALUES

('sentence', ARRAY['cerceamento de defesa','indeferimento de prova','julgamento antecipado'],
 'Indício forte de nulidade absoluta por cerceamento',
 'civil','recursal',
 'Nulidade Processual',
 'alto',88,true,15,
 'Interpor Apelação com preliminar de nulidade absoluta',
 'Apelação por Cerceamento de Defesa',
 'alto'),

('sentence', ARRAY['ônus da prova','art. 373','não comprovado'],
 'Distribuição incorreta do ônus probatório',
 'civil','recursal',
 'Erro na Valoração da Prova',
 'médio',72,false,15,
 'Interpor recurso sustentando inversão indevida do ônus',
 'Apelação por Erro de Valoração Probatória',
 'médio'),

('sentence', ARRAY['jurisprudência pacificada','tema repetitivo','stj'],
 'Sentença contrária à jurisprudência dominante',
 'civil','recursal',
 'Divergência Jurisprudencial',
 'alto',90,true,15,
 'Interpor apelação citando precedentes vinculantes',
 'Apelação com Fundamentação em Precedentes',
 'alto'),

('sentence', ARRAY['honorários','equidade','valor irrisório'],
 'Honorários abaixo do padrão jurisprudencial',
 'civil','recursal',
 'Majoração de Honorários',
 'médio',65,false,15,
 'Interpor recurso para majoração da verba honorária',
 'Apelação para Majoração de Honorários',
 'médio');

 INSERT INTO public.offline_ai_rules (rule_type, keywords, semantic_context, legal_area, procedural_stage, category, risk_level, probability_score, urgency, deadline_days, suggested_action, suggested_petition, financial_impact) VALUES
('publication', ARRAY['preparo','custas recursais','recolher'], 'Pagamento obrigatório para admissibilidade recursal',
 'civil','recursal','Risco de Deserção','crítico',NULL,true,2,
 'Emitir guia e alertar cliente imediatamente',
 'Petição de Juntada de Preparo','crítico'),

('publication', ARRAY['sisbajud','bloqueio','valor constrito'], 'Bloqueio patrimonial identificado',
 'execução','execução','Constrição Patrimonial','crítico',NULL,true,1,
 'Analisar desbloqueio por impenhorabilidade ou excesso',
 'Impugnação à Penhora SISBAJUD','crítico'),

('publication', ARRAY['alvará','levantamento','transferência'], 'Liberação financeira detectada',
 'financeiro','cumprimento','Crédito Liberado','baixo',NULL,true,1,
 'Notificar cliente e iniciar cobrança de honorários',
 'Petição de Levantamento de Valores','alto');

 INSERT INTO public.offline_ai_rules (rule_type, keywords, semantic_context, legal_area, procedural_stage, category, risk_level, probability_score, urgency, deadline_days, suggested_action, suggested_petition, financial_impact) VALUES
('publication', ARRAY['audiência de custódia','prisão em flagrante'],
 'Risco imediato de prisão preventiva',
 'penal','inicial','Custódia','crítico',NULL,true,0,
 'Preparar tese de liberdade provisória',
 'Pedido de Relaxamento de Prisão','crítico'),

('sentence', ARRAY['condeno','pena privativa','regime fechado'],
 'Condenação com regime gravoso',
 'penal','recursal','Sentença Condenatória','crítico',35,true,15,
 'Interpor apelação buscando absolvição ou regime mais brando',
 'Apelação Criminal','crítico');

 INSERT INTO public.offline_ai_rules (rule_type, keywords, semantic_context, legal_area, procedural_stage, category, risk_level, probability_score, urgency, deadline_days, suggested_action, suggested_petition, financial_impact) VALUES
('sentence', ARRAY['alimentos provisórios','fixo','desconto em folha'],
 'Fixação liminar de alimentos',
 'familia','inicial','Alimentos','alto',85,true,5,
 'Solicitar revisão ou parcelamento',
 'Revisional de Alimentos','alto'),

('publication', ARRAY['busca e apreensão','menor','guarda'],
 'Risco emocional e jurídico elevado',
 'familia','urgente','Busca de Menor','crítico',NULL,true,0,
 'Atuação emergencial imediata',
 'Pedido Liminar de Restituição de Menor','crítico');

 CREATE TABLE IF NOT EXISTS public.ai_meta_rules (
  id SERIAL PRIMARY KEY,
  pattern TEXT[],
  inference TEXT,
  action TEXT,
  risk_level TEXT
);

INSERT INTO public.ai_meta_rules (pattern, inference, action, risk_level) VALUES
(ARRAY['procedente','dano moral','quantum baixo'],
 'Alta chance de majoração em segundo grau',
 'Sugerir recurso visando aumento indenizatório',
 'médio'),

(ARRAY['indeferido','prova','testemunha'],
 'Probabilidade elevada de nulidade por cerceamento',
 'Sugerir preliminar recursal',
 'alto'),

(ARRAY['execução','penhora','conta salário'],
 'Forte tese de impenhorabilidade',
 'Sugerir desbloqueio imediato',
 'crítico');

 CREATE TABLE IF NOT EXISTS public.offline_ai_rules (
    id SERIAL PRIMARY KEY,
    rule_type TEXT,                  -- sentence | publication | despacho | acórdão
    keywords TEXT[],
    semantic_context TEXT,           -- contextual meaning
    legal_area TEXT,                 -- civil | consumidor | penal | trabalhista | familia | tributario | previdenciario
    procedural_stage TEXT,           -- inicial | conhecimento | recursal | execução | cumprimento
    category TEXT,
    risk_level TEXT,                 -- baixo | médio | alto | crítico
    probability_score INTEGER,       -- 0–100
    urgency BOOLEAN,
    deadline_days INTEGER,           -- prazo processual
    suggested_action TEXT,
    suggested_petition TEXT,         -- modelo de peça sugerida
    financial_impact TEXT            -- baixo | médio | alto | crítico
);