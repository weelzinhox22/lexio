-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para queries frequentes do dashboard

-- Processes
CREATE INDEX IF NOT EXISTS idx_processes_user_status ON public.processes(user_id, status);
CREATE INDEX IF NOT EXISTS idx_processes_user_created ON public.processes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_processes_user_priority ON public.processes(user_id, priority) WHERE status = 'active';

-- Deadlines
CREATE INDEX IF NOT EXISTS idx_deadlines_user_status_date ON public.deadlines(user_id, status, deadline_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_pending ON public.deadlines(user_id, deadline_date) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_deadlines_process ON public.deadlines(process_id) WHERE process_id IS NOT NULL;

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_channel_status ON public.notifications(user_id, channel, notification_status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_sent ON public.notifications(user_id, sent_at DESC) WHERE notification_status = 'sent';
CREATE INDEX IF NOT EXISTS idx_notifications_dedupe ON public.notifications(user_id, dedupe_key);

-- Clients
CREATE INDEX IF NOT EXISTS idx_clients_user_created ON public.clients(user_id, created_at DESC);

-- Financial Transactions
CREATE INDEX IF NOT EXISTS idx_financial_user_type_status ON public.financial_transactions(user_id, type, status);
CREATE INDEX IF NOT EXISTS idx_financial_user_created ON public.financial_transactions(user_id, created_at DESC);

-- Audiences
CREATE INDEX IF NOT EXISTS idx_audiences_user_date_status ON public.audiences(user_id, audience_date, status);
CREATE INDEX IF NOT EXISTS idx_audiences_user_scheduled ON public.audiences(user_id, audience_date) WHERE status = 'scheduled';

-- Process Updates (Movimentações)
CREATE INDEX IF NOT EXISTS idx_process_updates_user_created ON public.process_updates(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_process_updates_process ON public.process_updates(process_id, created_at DESC);

-- Referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_status ON public.referrals(referrer_id, status);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);

-- Profiles (referral codes)
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by) WHERE referred_by IS NOT NULL;

SELECT 'Índices de performance criados com sucesso!' as status;


