-- 050_client_portal_and_onboarding.sql
-- Script para expandir o módulo de Clientes com o Portal e Onboarding Automático

-- 1. ADICIONANDO NOVOS CAMPOS À TABELA DE CLIENTES PARA RECEBER O AUTO-CADASTRO E O PORTAL
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS portal_access_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS portal_password TEXT,
ADD COLUMN IF NOT EXISTS document_rg TEXT,
ADD COLUMN IF NOT EXISTS address_cep TEXT,
ADD COLUMN IF NOT EXISTS address_city TEXT,
ADD COLUMN IF NOT EXISTS address_state TEXT,
ADD COLUMN IF NOT EXISTS address_neighborhood TEXT,
ADD COLUMN IF NOT EXISTS address_number TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS profession TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'brasileiro(a)';

-- 2. TABELA DE LINKS DE ONBOARDING (Auto-Cadastro)
CREATE TABLE IF NOT EXISTS public.onboarding_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.onboarding_links ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança rigorosas (Apenas o advogado dono gerencia os links no painel)
CREATE POLICY "Users can manage their own onboarding links"
    ON public.onboarding_links FOR ALL
    USING (auth.uid() = user_id);

-- Para o ambiente público do cliente acessar o token e preencher os dados,
-- nós usaremos rotas na API do Next.js passando via Service Role, sem precisar
-- expor RLS público na tabela (Máxima Privacidade).

-- 3. BUCKET DE STORAGE PARA DOCUMENTOS DOS CLIENTES (Identidade / Comprovantes)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('client_uploads', 'client_uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Policies de upload de documentos no Bucket serão feitas via Backend Service Role
-- garantindo que terceiros invasores não acessem arquivos.
