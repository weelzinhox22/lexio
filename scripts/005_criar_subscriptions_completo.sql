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

-- PASSO 2: Dropar tudo relacionado (limpar)
-- ============================================

DROP TRIGGER IF EXISTS on_profile_created_subscription ON public.profiles;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
DROP FUNCTION IF EXISTS public.handle_new_user_subscription() CASCADE;

DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_own" ON public.subscriptions;
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;

DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- PASSO 3: Criar tabela subscriptions
-- ============================================

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 4: Criar tabela notifications
-- ============================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  channel TEXT NOT NULL,
  notification_status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 5: Criar índices
-- ============================================

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_status ON public.notifications(notification_status);
CREATE INDEX idx_notifications_created ON public.notifications(created_at);

-- PASSO 6: Habilitar RLS
-- ============================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PASSO 7: Criar políticas RLS
-- ============================================

CREATE POLICY "subscriptions_select_own" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_own" 
  ON public.subscriptions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own" 
  ON public.subscriptions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_select_own" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_own" 
  ON public.notifications FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- PASSO 8: Criar função de trigger
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

-- PASSO 9: Criar triggers
-- ============================================

CREATE TRIGGER on_profile_created_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_subscription();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- PASSO 10: Criar subscriptions para usuários existentes
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

-- PASSO 11: Verificar se funcionou
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

