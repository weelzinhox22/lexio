-- Migração para Inteligência Criminal / Jurimetria (The Mixa)

-- 1. Regras de Teses Jurídicas
CREATE TABLE IF NOT EXISTS public.legal_theses_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    law_article TEXT,
    trigger_keywords TEXT[], -- Palavras que ativam a tese no NLP
    logic_condition JSONB,    -- Configuração da lógica (ex: { "type": "depurador_5_anos" })
    suggested_text TEXT,      -- Minuta base da tese
    category TEXT DEFAULT 'criminal',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Inteligência de Julgador (Mapa de Calor)
CREATE TABLE IF NOT EXISTS public.judge_intelligence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    judge_name TEXT NOT NULL,
    court_chamber TEXT,       -- Câmara / Turma
    matter TEXT,              -- Ex: Tráfico, Roubo, Estelionato
    incident_type TEXT DEFAULT 'Habeas Corpus', -- HC, Apelação, etc
    decision_outcome TEXT CHECK (decision_outcome IN ('concedido', 'negado', 'parcial')),
    is_public BOOLEAN DEFAULT false, -- Se pode ser usado na base global anonimizada
    date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Histórico Criminal do Cliente (Para Calculadora de Reincidência)
CREATE TABLE IF NOT EXISTS public.client_criminal_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    description TEXT,
    conviction_date DATE,     -- Data da condenação
    extinction_date DATE,      -- Data da extinção da punibilidade (início do prazo depurador)
    penalty_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Inserindo a primeira regra de ouro: Período Depurador
INSERT INTO public.legal_theses_rules (title, law_article, logic_condition, suggested_text)
VALUES (
    'Extinção da Reincidência (Período Depurador)',
    'Art. 64, I do Código Penal',
    '{"type": "date_diff_years", "value": 5}',
    'Conforme o Art. 64, inciso I, do Código Penal, não prevalece a condenação anterior se entre a data do cumprimento ou extinção da pena e a infração posterior tiver decorrido período de tempo superior a 5 (cinco) anos. No caso em tela, verifica-se que o período depurador já foi atingido, devendo o réu ser considerado primário para fins de dosimetria.'
);
