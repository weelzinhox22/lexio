-- Script to verify if everything was created correctly
-- Run this after executing scripts 001, 002, and 003

-- Check if all tables exist
SELECT 
  'profiles' as table_name, 
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') as exists
UNION ALL
SELECT 'clients', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'clients')
UNION ALL
SELECT 'processes', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'processes')
UNION ALL
SELECT 'deadlines', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'deadlines')
UNION ALL
SELECT 'documents', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'documents')
UNION ALL
SELECT 'financial_transactions', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_transactions')
UNION ALL
SELECT 'leads', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'leads')
UNION ALL
SELECT 'tasks', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks')
UNION ALL
SELECT 'appointments', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments')
UNION ALL
SELECT 'subscriptions', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions')
UNION ALL
SELECT 'notifications', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications');

-- Check subscription count
SELECT 
  'Total subscriptions' as info,
  COUNT(*) as count
FROM public.subscriptions;

-- Check if your user has a subscription
SELECT 
  s.id,
  s.user_id,
  s.plan,
  s.status,
  s.trial_ends_at,
  s.current_period_end,
  p.email
FROM public.subscriptions s
JOIN public.profiles p ON p.id = s.user_id
WHERE s.user_id = auth.uid();
