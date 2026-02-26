-- Adicionar nova regra para Tutela de Urgência (Empréstimos/Descontos Indevidos)
INSERT INTO public.offline_ai_rules (rule_type, keywords, category, suggested_action, probability_score, priority_level) 
VALUES (
    'sentence', 
    ARRAY['tutela de urgência', 'suspensão dos descontos', 'multa diária', 'art. 300'], 
    'Tutela de Urgência Deferida (Descontos)', 
    'Acompanhar efetivo cumprimento pelo banco sob pena de multa. Agendar verificação em 5 dias.', 
    90, 
    'urgent'
);
