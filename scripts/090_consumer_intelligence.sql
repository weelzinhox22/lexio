-- Inteligência em Direito do Consumidor
-- Foco: Repetição de Indébito e Danos Morais

-- 1. Tabela de Simulações de Consumidor
CREATE TABLE IF NOT EXISTS public.consumer_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    simulation_type TEXT NOT NULL CHECK (simulation_type IN ('repeticao_indebito', 'dano_moral', 'desvio_produtivo')),
    client_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Itens de Cobrança (para Repetição de Indébito)
CREATE TABLE IF NOT EXISTS public.consumer_indebito_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    simulation_id UUID REFERENCES public.consumer_simulations(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    original_value DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    has_complaint BOOLEAN DEFAULT false,
    complaint_protocol TEXT,
    is_double_repayment BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.consumer_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumer_indebito_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consumer_sim_select_own" ON public.consumer_simulations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "consumer_sim_insert_own" ON public.consumer_simulations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "consumer_sim_update_own" ON public.consumer_simulations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "consumer_sim_delete_own" ON public.consumer_simulations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "consumer_items_select" ON public.consumer_indebito_items FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.consumer_simulations WHERE id = simulation_id AND user_id = auth.uid()));
CREATE POLICY "consumer_items_insert" ON public.consumer_indebito_items FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.consumer_simulations WHERE id = simulation_id AND user_id = auth.uid()));
CREATE POLICY "consumer_items_update" ON public.consumer_indebito_items FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM public.consumer_simulations WHERE id = simulation_id AND user_id = auth.uid()));
CREATE POLICY "consumer_items_delete" ON public.consumer_indebito_items FOR DELETE 
    USING (EXISTS (SELECT 1 FROM public.consumer_simulations WHERE id = simulation_id AND user_id = auth.uid()));
