-- 047_advanced_jurimetrics_schema_upgrade.sql
-- 1. Upgrade na tabela existente para suportar os novos campos geniais (SEM recriar a tabela e destruir os dados atuais)
ALTER TABLE public.offline_ai_rules 
ADD COLUMN IF NOT EXISTS semantic_context TEXT,
ADD COLUMN IF NOT EXISTS legal_area TEXT,
ADD COLUMN IF NOT EXISTS procedural_stage TEXT,
ADD COLUMN IF NOT EXISTS risk_level TEXT,
ADD COLUMN IF NOT EXISTS urgency BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deadline_days INTEGER,
ADD COLUMN IF NOT EXISTS suggested_petition TEXT,
ADD COLUMN IF NOT EXISTS financial_impact TEXT;

-- 2. Tabela auxiliar de Meta Rules
CREATE TABLE IF NOT EXISTS public.ai_meta_rules (
  id SERIAL PRIMARY KEY,
  pattern TEXT[],
  inference TEXT,
  action TEXT,
  risk_level TEXT
);

-- ==========================================================
-- INSERÇÕES DE REGRAS (Utilizando a estrutura antiga compatível)
-- ==========================================================
INSERT INTO public.offline_ai_rules (rule_type, keywords, category, suggested_action, probability_score, priority_level) VALUES
('sentence', ARRAY['sucumbência recíproca', 'honorários', 'proporcionalidade'], 'Sentença: Sucumbência Parcial', 'Analisar base de cálculo dos honorários. Se fixado sobre o valor da causa e não sobre o proveito econômico, cabe ED ou Recurso.', 70, 'high'),
('sentence', ARRAY['ilegitimidade passiva', 'extinto sem resolução', 'art. 485', 'extinção'], 'Extinção sem Mérito (Ilegitimidade)', 'Probabilidade de reversão baixa se a prova documental estiver ausente. Sugerir nova ação corrigindo o polo passivo.', 20, 'high'),
('sentence', ARRAY['cerceamento de defesa', 'indeferimento de prova', 'testemunha'], 'Cerceamento de Defesa Detectado', 'Tese Recursal: Preliminar de nulidade da sentença por cerceamento de defesa. Chance de anulação alta em tribunais superiores.', 85, 'urgent'),
('sentence', ARRAY['dano moral', 'quantum', 'razoabilidade', 'proporcionalidade'], 'Dano Moral - Valor Baixo', 'Jurimetria indica média superior para casos análogos. Sugerir recurso para majoração do valor (Pedido de Majoração).', 60, 'medium'),
('publication', ARRAY['custas processuais', 'guia', 'preparo', 'recolhimento', 'deserção'], 'Financeiro: Pagamento de Custas', 'Detectado comando de pagamento. Criar lembrete financeiro para emissão de guia sob pena de deserção/extinção.', NULL, 'urgent'),
('publication', ARRAY['perito', 'honorários periciais', 'estimativa', 'depositar'], 'Financeiro: Honorários do Perito', 'O juiz fixou honorários periciais. Notificar cliente para depósito ou impugnar valor se exorbitante.', NULL, 'high'),
('publication', ARRAY['multa diária', 'astreintes', 'descumprimento'], 'Risco: Incidência de Multa', 'URGENTE: O juiz fixou ou executou multa diária. Verificar cumprimento imediato da obrigação de fazer.', NULL, 'urgent'),
('sentence', ARRAY['tabela price', 'anatocismo', 'capitalização', 'juros'], 'Revisional: Juros Abusivos', 'Analisar se a taxa contratada está acima da taxa média do BACEN para o período. Chance média de provimento.', 50, 'medium'),
('sentence', ARRAY['tarifa de cadastro', 'seguro', 'venda casada'], 'Revisional: Vendas Casadas', 'Tese consolidada no STJ. Procedência alta para devolução de valores de seguros não solicitados.', 90, 'high'),
('publication', ARRAY['recurso inominado', 'tempestivo', 'efeito devolutivo'], 'JEC: Recurso Inominado Interposto', 'Prazo de 10 dias para contrarrazões. Atenção: no JEC o preparo deve ser feito em 48h após o recurso.', NULL, 'urgent'),
('sentence', ARRAY['embargos de declaração', 'omissão', 'contradição', 'obscuridade'], 'Decisão em Embargos', 'Verificar se houve efeito infringente (mudança da sentença). Se sim, abre-se novo prazo recursal.', 95, 'high'),
('publication', ARRAY['efeito suspensivo', 'concedo', 'agravante', 'liminarmente'], 'Agravo: Efeito Suspensivo Deferido', 'A decisão anterior está pausada. Notificar cliente que a urgência foi atendida/bloqueada.', NULL, 'urgent'),
('publication', ARRAY['contraminuta', 'agravo de instrumento'], 'Intimação: Contraminuta', 'Apresentar defesa contra o recurso da parte contrária no Tribunal (2ª instância).', NULL, 'high');

-- ==========================================================
-- INSERÇÕES AVANÇADAS (COMPLETAS COM OS NOVOS CAMPOS)
-- ==========================================================
INSERT INTO public.offline_ai_rules 
(rule_type, keywords, semantic_context, legal_area, procedural_stage, category, risk_level, probability_score, urgency, deadline_days, suggested_action, suggested_petition, financial_impact)
VALUES
('sentence', ARRAY['cerceamento de defesa','indeferimento de prova','julgamento antecipado'], 'Indício forte de nulidade absoluta por cerceamento', 'civil','recursal', 'Nulidade Processual', 'alto',88,true,15, 'Interpor Apelação com preliminar de nulidade absoluta', 'Apelação por Cerceamento de Defesa', 'alto'),
('sentence', ARRAY['ônus da prova','art. 373','não comprovado'], 'Distribuição incorreta do ônus probatório', 'civil','recursal', 'Erro na Valoração da Prova', 'médio',72,false,15, 'Interpor recurso sustentando inversão indevida do ônus', 'Apelação por Erro de Valoração Probatória', 'médio'),
('sentence', ARRAY['jurisprudência pacificada','tema repetitivo','stj'], 'Sentença contrária à jurisprudência dominante', 'civil','recursal', 'Divergência Jurisprudencial', 'alto',90,true,15, 'Interpor apelação citando precedentes vinculantes', 'Apelação com Fundamentação em Precedentes', 'alto'),
('sentence', ARRAY['honorários','equidade','valor irrisório'], 'Honorários abaixo do padrão jurisprudencial', 'civil','recursal', 'Majoração de Honorários', 'médio',65,false,15, 'Interpor recurso para majoração da verba honorária', 'Apelação para Majoração de Honorários', 'médio'),
('publication', ARRAY['preparo','custas recursais','recolher'], 'Pagamento obrigatório para admissibilidade recursal', 'civil','recursal','Risco de Deserção','crítico',NULL,true,2, 'Emitir guia e alertar cliente imediatamente', 'Petição de Juntada de Preparo','crítico'),
('publication', ARRAY['sisbajud','bloqueio','valor constrito'], 'Bloqueio patrimonial identificado', 'execução','execução','Constrição Patrimonial','crítico',NULL,true,1, 'Analisar desbloqueio por impenhorabilidade ou excesso', 'Impugnação à Penhora SISBAJUD','crítico'),
('publication', ARRAY['alvará','levantamento','transferência'], 'Liberação financeira detectada', 'financeiro','cumprimento','Crédito Liberado','baixo',NULL,true,1, 'Notificar cliente e iniciar cobrança de honorários', 'Petição de Levantamento de Valores','alto'),
('publication', ARRAY['audiência de custódia','prisão em flagrante'], 'Risco imediato de prisão preventiva', 'penal','inicial','Custódia','crítico',NULL,true,0, 'Preparar tese de liberdade provisória', 'Pedido de Relaxamento de Prisão','crítico'),
('sentence', ARRAY['condeno','pena privativa','regime fechado'], 'Condenação com regime gravoso', 'penal','recursal','Sentença Condenatória','crítico',35,true,15, 'Interpor apelação buscando absolvição ou regime mais brando', 'Apelação Criminal','crítico'),
('sentence', ARRAY['alimentos provisórios','fixo','desconto em folha'], 'Fixação liminar de alimentos', 'familia','inicial','Alimentos','alto',85,true,5, 'Solicitar revisão ou parcelamento', 'Revisional de Alimentos','alto'),
('publication', ARRAY['busca e apreensão','menor','guarda'], 'Risco emocional e jurídico elevado', 'familia','urgente','Busca de Menor','crítico',NULL,true,0, 'Atuação emergencial imediata', 'Pedido Liminar de Restituição de Menor','crítico');

-- META RULES INSERTS
INSERT INTO public.ai_meta_rules (pattern, inference, action, risk_level) VALUES
(ARRAY['procedente','dano moral','quantum baixo'], 'Alta chance de majoração em segundo grau', 'Sugerir recurso visando aumento indenizatório', 'médio'),
(ARRAY['indeferido','prova','testemunha'], 'Probabilidade elevada de nulidade por cerceamento', 'Sugerir preliminar recursal', 'alto'),
(ARRAY['execução','penhora','conta salário'], 'Forte tese de impenhorabilidade', 'Sugerir desbloqueio imediato', 'crítico');
