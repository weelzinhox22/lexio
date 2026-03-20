-- 049_saved_jurimetrics_history.sql
-- Tabela segura com RLS para o advogado salvar suas análises jurimétricas concluídas

CREATE TABLE IF NOT EXISTS public.saved_jurimetrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    document_preview TEXT NOT NULL,
    rule_category TEXT NOT NULL,
    risk_level TEXT,
    probability_score INTEGER,
    suggested_action TEXT,
    suggested_petition TEXT,
    deadline_days INTEGER,
    financial_impact TEXT,
    full_analysis_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.saved_jurimetrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved jurimetrics" 
    ON public.saved_jurimetrics FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved jurimetrics" 
    ON public.saved_jurimetrics FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved jurimetrics" 
    ON public.saved_jurimetrics FOR DELETE 
    USING (auth.uid() = user_id);
