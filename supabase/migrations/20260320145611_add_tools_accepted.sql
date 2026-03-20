-- Migration: Add tools_accepted and accepted_at to users/profiles
-- Desc: Add columns to track if a user has accepted the terms of responsibility for beta tools.

-- Assuming your users table is called `profiles` and linked to auth.users
-- Se sua tabela for `users` em public, altere o nome da tabela abaixo.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tools_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tools_accepted_at TIMESTAMP WITH TIME ZONE;

-- (Opcional) Atualizar usuários existentes caso queira dar bypass (opcional, recomendado manter FALSE para que todos aceitem)
-- UPDATE public.profiles SET tools_accepted = FALSE WHERE tools_accepted IS NULL;

-- Assegurar o acesso à nova coluna nas políticas do RLS (Row Level Security), se aplicável. 
-- Normalmente colunas novas já herdam permissões de SELECT/UPDATE da tabela.
