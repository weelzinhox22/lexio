-- ============================================
-- SCRIPT UNIFICADO PARA CRIAR SUBSCRIPTIONS
-- Este script verifica TODAS as dependências antes
-- ============================================

-- VERIFICAR SE A TABELA PROFILES EXISTE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) THEN
        RAISE EXCEPTION 'ERRO: Tabela profiles não existe! Execute primeiro: scripts/001_create_schema.sql e scripts/002_create_triggers.sql';
    END IF;
END $$;

-- PASSO 1: Garantir que a função update_updated_at_column existe
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASSO 2: Verificar se as tabelas existem
-- ============================================

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

-- PASSO 2.1: Limpar apenas triggers e funções (não as tabelas)
-- ============================================

DROP TRIGGER IF EXISTS on_profile_created_subscription ON public.profiles;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
DROP FUNCTION IF EXISTS public.handle_new_user_subscription() CASCADE;

-- PASSO 3: Criar índices (se não existirem)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(notification_status);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at);

-- PASSO 4: Criar função de trigger
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

-- PASSO 5: Criar triggers
-- ============================================

CREATE TRIGGER on_profile_created_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_subscription();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- PASSO 6: Criar subscriptions para usuários existentes
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
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions s WHERE s.user_id = p.id
);

-- PASSO 7: Verificar se funcionou
-- ============================================

DO $$
DECLARE
  subscription_count INTEGER;
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO subscription_count FROM public.subscriptions;
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  
  RAISE NOTICE '✅ Subscriptions criadas: %', subscription_count;
  RAISE NOTICE '✅ Profiles existentes: %', profile_count;
  RAISE NOTICE '✅ Sistema de assinaturas instalado com sucesso!';
END $$;

-- Mostrar uma subscription de exemplo (se existir)
SELECT 
  s.id,
  s.user_id,
  s.plan,
  s.status,
  s.trial_ends_at,
  p.email
FROM public.subscriptions s
JOIN public.profiles p ON p.id = s.user_id
LIMIT 1;

