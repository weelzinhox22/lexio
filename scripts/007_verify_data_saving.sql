-- ============================================
-- VERIFICAÇÃO DE DADOS NO BANCO
-- Execute este script para verificar se os dados estão sendo salvos corretamente
-- ============================================

-- 1. Verificar todas as tabelas e contagem de registros
SELECT 
  'profiles' as tabela,
  COUNT(*) as total_registros
FROM public.profiles
UNION ALL
SELECT 'clients', COUNT(*) FROM public.clients
UNION ALL
SELECT 'processes', COUNT(*) FROM public.processes
UNION ALL
SELECT 'deadlines', COUNT(*) FROM public.deadlines
UNION ALL
SELECT 'documents', COUNT(*) FROM public.documents
UNION ALL
SELECT 'financial_transactions', COUNT(*) FROM public.financial_transactions
UNION ALL
SELECT 'leads', COUNT(*) FROM public.leads
UNION ALL
SELECT 'tasks', COUNT(*) FROM public.tasks
UNION ALL
SELECT 'appointments', COUNT(*) FROM public.appointments
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM public.subscriptions
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL
SELECT 'process_updates', COUNT(*) FROM public.process_updates
ORDER BY tabela;

-- 2. Verificar últimos registros criados (últimas 24 horas)
SELECT 
  'Últimos Clientes' as tipo,
  COUNT(*) as total
FROM public.clients
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 'Últimos Processos', COUNT(*) 
FROM public.processes
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 'Últimos Prazos', COUNT(*) 
FROM public.deadlines
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 'Últimos Documentos', COUNT(*) 
FROM public.documents
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 'Últimas Transações', COUNT(*) 
FROM public.financial_transactions
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 'Últimos Leads', COUNT(*) 
FROM public.leads
WHERE created_at > NOW() - INTERVAL '24 hours';

-- 3. Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_ativado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'clients', 'processes', 'deadlines', 
    'documents', 'financial_transactions', 'leads', 
    'tasks', 'appointments', 'subscriptions', 'notifications'
  )
ORDER BY tablename;

-- 4. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as comando
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Verificar integridade de foreign keys
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 6. Verificar subscriptions e usuários
SELECT 
  s.id,
  s.user_id,
  s.plan,
  s.status,
  s.current_period_start,
  s.current_period_end,
  p.full_name,
  p.email,
  CASE 
    WHEN s.current_period_end < NOW() THEN 'Expirado'
    WHEN s.current_period_end < NOW() + INTERVAL '7 days' THEN 'Expirando em breve'
    ELSE 'Ativo'
  END as status_periodo
FROM public.subscriptions s
LEFT JOIN public.profiles p ON p.id = s.user_id
ORDER BY s.created_at DESC
LIMIT 10;

-- 7. Verificar se há dados órfãos (sem user_id válido)
SELECT 
  'clients sem user_id válido' as problema,
  COUNT(*) as total
FROM public.clients c
LEFT JOIN public.profiles p ON p.id = c.user_id
WHERE p.id IS NULL
UNION ALL
SELECT 'processes sem user_id válido', COUNT(*)
FROM public.processes pr
LEFT JOIN public.profiles p ON p.id = pr.user_id
WHERE p.id IS NULL
UNION ALL
SELECT 'deadlines sem user_id válido', COUNT(*)
FROM public.deadlines d
LEFT JOIN public.profiles p ON p.id = d.user_id
WHERE p.id IS NULL;

-- Success message
SELECT '✅ Verificação concluída! Revise os resultados acima.' as resultado;



