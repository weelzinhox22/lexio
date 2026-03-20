-- Tabela para armazenar as regras de IA offline (sem uso de APIs externas)
CREATE TABLE IF NOT EXISTS public.offline_ai_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('publication', 'sentence')),
    keywords TEXT[] NOT NULL,
    category VARCHAR(100) NOT NULL,
    suggested_action TEXT,
    probability_score INTEGER, -- 0 a 100
    priority_level VARCHAR(20) DEFAULT 'medium',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ativar RLS
ALTER TABLE public.offline_ai_rules ENABLE ROW LEVEL SECURITY;

-- Políticas: Todos os usuários logados podem ler, apenas admins podem editar
CREATE POLICY "Qualquer usuário logado pode ler regras de IA offline"
    ON public.offline_ai_rules
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Inserir regras básicas Iniciais para Publicações do Diário Oficial
INSERT INTO public.offline_ai_rules (rule_type, keywords, category, suggested_action, priority_level) VALUES
('publication', ARRAY['custas', 'pagamento', 'preparo', 'recolher'], 'Pagamento de Custas', 'Criar lembrete financeiro para pagamento de custas', 'high'),
('publication', ARRAY['contestar', 'contestação', 'defesa', '15 dias'], 'Apresentar Defesa', 'Criar prazo automático de Contestação (15 dias)', 'urgent'),
('publication', ARRAY['improcedente', 'sem razão', 'nego provimento', 'ausência de provas'], 'Decisão Desfavorável', 'Considerar Recurso Inominado ou Apelação Cível', 'high'),
('publication', ARRAY['procedente', 'condeno', 'procedência parcial', 'toda a prova'], 'Decisão Favorável', 'Aguardar prazo para Cumprimento de Sentença', 'medium'),
('publication', ARRAY['embargos de declaração', 'omissão', 'contradição', 'obscuridade'], 'Julgamento de Embargos', 'Analisar prazo reaberto para Apelação ou Recurso', 'high'),
('publication', ARRAY['arquivamento', 'baixa', 'extinto', 'trânsito em julgado'], 'Encerramento', 'Arquivar processo no painel Kanban', 'low');

-- Inserir regras para Análise de Sentença local sem API
INSERT INTO public.offline_ai_rules (rule_type, keywords, category, suggested_action, probability_score, priority_level) VALUES
('sentence', ARRAY['mero aborrecimento', 'dano moral', 'não configurado', 'dissabor cotidiano'], 'Dano Moral Afastado', 'Tese Recursal sugerida: Fixação do dano in re ipsa focado em jurisprudência atual do STJ', 35, 'high'),
('sentence', ARRAY['juros abusivos', 'revisional', 'ilegalidade', 'taxa média do mercado'], 'Revisional Procedente', 'Aguardar trânsito em julgado para liquidação / cumprimento de sentença', 85, 'medium'),
('sentence', ARRAY['justa causa', 'reversão', 'prova insuficiente', 'abandono'], 'Justa Causa Afastada/Revertida', 'Cobrar cálculo de verbas rescisórias atualizadas', 70, 'high'),
('sentence', ARRAY['revelia', 'presunção de veracidade', 'não comparecimento'], 'Procedência por Revelia', 'Alta probabilidade de êxito na execução. Pode caber recurso por cerceamento de defesa.', 95, 'medium');

-- Atualizar metadados para tracking
COMMENT ON TABLE public.offline_ai_rules IS 'Motor de inteligência artificial offline do banco de dados (regras e jurimetria básica)';
