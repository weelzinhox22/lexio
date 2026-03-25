-- ====================================================================================
-- FIX: Adicionar políticas INSERT e DELETE na tabela notifications
-- ====================================================================================
-- A migração de segurança (20260320182000_security_rls_policies.sql) habilitou RLS
-- na tabela notifications mas apenas criou políticas SELECT e UPDATE.
-- Sem a política INSERT, a rota /api/deadlines/test-email e outras rotas que usam
-- o client com anon key não conseguem inserir registros de notificação.
-- ====================================================================================

-- Adicionar política de INSERT para notificações (usuário insere para si mesmo)
CREATE POLICY "Usuários inserem notificações para si mesmos"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Adicionar política de DELETE para notificações (usuário deleta suas próprias)
CREATE POLICY "Usuários deletam suas próprias notificações"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================================================================
-- Verificar que as tabelas deadlines, profiles e processes também
-- têm políticas INSERT quando necessário (para a rota de test-email)
-- ====================================================================================

-- Adicionar política INSERT para deadlines (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'deadlines'
    AND schemaname = 'public'
    AND polcmd = 'a'  -- 'a' = ALL / INSERT
    AND polname LIKE '%insert%'
  ) THEN
    EXECUTE 'CREATE POLICY "Usuários criam seus próprios prazos" ON public.deadlines FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END
$$;

-- Adicionar política UPDATE para deadlines (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'deadlines'
    AND schemaname = 'public'
    AND polcmd = 'w'  -- 'w' = UPDATE
  ) THEN
    EXECUTE 'CREATE POLICY "Usuários atualizam seus próprios prazos" ON public.deadlines FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END
$$;

-- Adicionar política DELETE para deadlines (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'deadlines'
    AND schemaname = 'public'
    AND polcmd = 'd'  -- 'd' = DELETE
  ) THEN
    EXECUTE 'CREATE POLICY "Usuários deletam seus próprios prazos" ON public.deadlines FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END
$$;

-- Verificar que time_entries e financial_transactions também têm INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'time_entries'
    AND schemaname = 'public'
    AND polcmd = 'a'
  ) THEN
    EXECUTE 'CREATE POLICY "Usuários criam time entries" ON public.time_entries FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'time_entries'
    AND schemaname = 'public'
    AND polcmd = 'w'
  ) THEN
    EXECUTE 'CREATE POLICY "Usuários atualizam time entries" ON public.time_entries FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'time_entries'
    AND schemaname = 'public'
    AND polcmd = 'd'
  ) THEN
    EXECUTE 'CREATE POLICY "Usuários deletam time entries" ON public.time_entries FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'financial_transactions'
    AND schemaname = 'public'
    AND polcmd = 'a'
  ) THEN
    EXECUTE 'CREATE POLICY "Usuários criam transações" ON public.financial_transactions FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'financial_transactions'
    AND schemaname = 'public'
    AND polcmd = 'w'
  ) THEN
    EXECUTE 'CREATE POLICY "Usuários atualizam transações" ON public.financial_transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'financial_transactions'
    AND schemaname = 'public'
    AND polcmd = 'd'
  ) THEN
    EXECUTE 'CREATE POLICY "Usuários deletam transações" ON public.financial_transactions FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END
$$;

SELECT 'FIX APLICADO: Políticas INSERT/DELETE adicionadas para notifications, deadlines, time_entries e financial_transactions' AS status;
