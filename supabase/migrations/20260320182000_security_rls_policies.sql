-- ====================================================================================
-- SCRIPT DE CIBERSEGURANÇA: Habilitar RLS e criar Políticas (auth.uid() = user_id)
-- ====================================================================================

-- 1. Força a ativação do Row Level Security nas principais tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penal_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para a tabela PROFILES (ID é o próprio auth.uid())
CREATE POLICY "Usuários veem apenas seus próprios perfis" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários atualizam apenas seus próprios perfis" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 3. Políticas para a tabela CLIENTS
CREATE POLICY "Advogados veem seus próprios clientes" ON public.clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Advogados criam clientes para si mesmos" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Advogados atualizam seus próprios clientes" ON public.clients
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Advogados deletam seus próprios clientes" ON public.clients
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Políticas para a tabela LEADS
CREATE POLICY "Usuários veem seus leads" ON public.leads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários criam leads" ON public.leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam leads" ON public.leads
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários deletam leads" ON public.leads
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Políticas para a tabela PENAL CALCULATIONS
CREATE POLICY "Acesso restrito aos próprios cálculos penais (SELECT)" ON public.penal_calculations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Acesso restrito aos próprios cálculos penais (INSERT)" ON public.penal_calculations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Acesso restrito aos próprios cálculos penais (UPDATE)" ON public.penal_calculations
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Acesso restrito aos próprios cálculos penais (DELETE)" ON public.penal_calculations
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Políticas para a tabela PROCESSES
CREATE POLICY "Processos limitados pelo user_id" ON public.processes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Criação de processos limitada" ON public.processes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Atualização de processos limitada" ON public.processes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Deleção de processos" ON public.processes FOR DELETE USING (auth.uid() = user_id);

-- 7. NOTIFICATIONS
CREATE POLICY "Somente dono vê notificações" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Somente dono atualiza notificações" ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AVISO: Políticas aplicadas aos recursos centrais para evitar Broken Object Level Authorization (BOLA/IDOR).
