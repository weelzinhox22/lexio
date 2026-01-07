-- ============================================
-- SUBSCRIPTION SYSTEM SETUP
-- Este script cria triggers e funções para o sistema de assinaturas
-- IMPORTANTE: Execute primeiro o script 001_create_schema.sql
-- ============================================

-- Verificar se as tabelas existem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions'
    ) THEN
        RAISE EXCEPTION 'ERRO: Tabela subscriptions não existe! Execute primeiro: scripts/001_create_schema.sql';
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) THEN
        RAISE EXCEPTION 'ERRO: Tabela profiles não existe! Execute primeiro: scripts/001_create_schema.sql';
    END IF;
END $$;

-- STEP 1: Limpar triggers e funções existentes (se houver)
-- ============================================

DROP TRIGGER IF EXISTS on_profile_created_subscription ON public.profiles;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
DROP FUNCTION IF EXISTS public.handle_new_user_subscription() CASCADE;

-- ============================================
-- STEP 2: Garantir que a função update_updated_at existe
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 3: CREATE TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (
    user_id, 
    status, 
    trial_ends_at, 
    current_period_end
  )
  VALUES (
    NEW.id,
    'trial',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 4: CREATE TRIGGERS
-- ============================================

CREATE TRIGGER on_profile_created_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_subscription();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 5: SEED TRIAL FOR EXISTING USERS
-- ============================================

INSERT INTO public.subscriptions (
  user_id, 
  status, 
  trial_ends_at, 
  current_period_end
)
SELECT 
  p.id,
  'trial',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days'
FROM public.profiles p
ON CONFLICT (user_id) DO NOTHING;

-- Success!
SELECT 'Subscription system installed successfully!' as result;
