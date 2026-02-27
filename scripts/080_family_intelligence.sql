-- Inteligência em Direito de Família e Sucessões
-- Foco: Simulador de Partilha com Rastreador de Sub-rogação

-- 1. Tabela de Simulações
CREATE TABLE IF NOT EXISTS public.family_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    marriage_regime TEXT NOT NULL CHECK (marriage_regime IN (
        'comunhao_parcial', 
        'comunhao_universal', 
        'separacao_total', 
        'participacao_questos'
    )),
    marriage_date DATE,
    separation_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Bens e Ativos
CREATE TABLE IF NOT EXISTS public.family_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    simulation_id UUID REFERENCES public.family_simulations(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    estimated_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    acquired_at DATE,
    is_subrogated BOOLEAN DEFAULT false,
    subrogation_details TEXT, -- Detalhes da origem do recurso (ex: imóvel vendido pré-casamento)
    ownership_type TEXT DEFAULT 'common' CHECK (ownership_type IN ('common', 'spouse_a', 'spouse_b')),
    category TEXT DEFAULT 'imovel' CHECK (category IN ('imovel', 'veiculo', 'investimento', 'empresa', 'outro')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.family_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "family_sim_select_own" ON public.family_simulations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "family_sim_insert_own" ON public.family_simulations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "family_sim_update_own" ON public.family_simulations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "family_sim_delete_own" ON public.family_simulations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "family_assets_select" ON public.family_assets FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.family_simulations WHERE id = simulation_id AND user_id = auth.uid()));
CREATE POLICY "family_assets_insert" ON public.family_assets FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.family_simulations WHERE id = simulation_id AND user_id = auth.uid()));
CREATE POLICY "family_assets_update" ON public.family_assets FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM public.family_simulations WHERE id = simulation_id AND user_id = auth.uid()));
CREATE POLICY "family_assets_delete" ON public.family_assets FOR DELETE 
    USING (EXISTS (SELECT 1 FROM public.family_simulations WHERE id = simulation_id AND user_id = auth.uid()));
