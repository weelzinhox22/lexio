-- =============================================
-- Migration 092: Intern Data Sharing
-- =============================================
-- Allows interns to access their owner's (lawyer) data
-- by creating a function that resolves the effective user ID.

-- 1. Create the effective_uid() function
-- For interns: returns the owner_id (lawyer's id)
-- For lawyers/admins: returns auth.uid()
CREATE OR REPLACE FUNCTION public.effective_uid()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  owner UUID;
BEGIN
  -- Check if the current user is an intern
  SELECT i.owner_id INTO owner
  FROM public.interns i
  WHERE i.user_id = auth.uid()
    AND i.status = 'active'
  LIMIT 1;

  -- If intern, return their owner's id; otherwise return their own id
  IF owner IS NOT NULL THEN
    RETURN owner;
  ELSE
    RETURN auth.uid();
  END IF;
END;
$$;

-- 2. Update RLS policies on key tables to use effective_uid()
-- This allows interns to see data belonging to their lawyer (owner)

-- ── PROCESSES ────────────────────
DROP POLICY IF EXISTS "processes_select_own" ON public.processes;
CREATE POLICY "processes_select_own" ON public.processes
  FOR SELECT USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "processes_insert_own" ON public.processes;
CREATE POLICY "processes_insert_own" ON public.processes
  FOR INSERT WITH CHECK (user_id = public.effective_uid());

DROP POLICY IF EXISTS "processes_update_own" ON public.processes;
CREATE POLICY "processes_update_own" ON public.processes
  FOR UPDATE USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "processes_delete_own" ON public.processes;
CREATE POLICY "processes_delete_own" ON public.processes
  FOR DELETE USING (user_id = public.effective_uid());

-- ── DEADLINES ────────────────────
DROP POLICY IF EXISTS "deadlines_select_own" ON public.deadlines;
CREATE POLICY "deadlines_select_own" ON public.deadlines
  FOR SELECT USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "deadlines_insert_own" ON public.deadlines;
CREATE POLICY "deadlines_insert_own" ON public.deadlines
  FOR INSERT WITH CHECK (user_id = public.effective_uid());

DROP POLICY IF EXISTS "deadlines_update_own" ON public.deadlines;
CREATE POLICY "deadlines_update_own" ON public.deadlines
  FOR UPDATE USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "deadlines_delete_own" ON public.deadlines;
CREATE POLICY "deadlines_delete_own" ON public.deadlines
  FOR DELETE USING (user_id = public.effective_uid());

-- ── NOTIFICATIONS ────────────────
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;
CREATE POLICY "notifications_insert_own" ON public.notifications
  FOR INSERT WITH CHECK (user_id = public.effective_uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (user_id = public.effective_uid());

-- ── CLIENTS ──────────────────────
DROP POLICY IF EXISTS "clients_select_own" ON public.clients;
CREATE POLICY "clients_select_own" ON public.clients
  FOR SELECT USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "clients_insert_own" ON public.clients;
CREATE POLICY "clients_insert_own" ON public.clients
  FOR INSERT WITH CHECK (user_id = public.effective_uid());

DROP POLICY IF EXISTS "clients_update_own" ON public.clients;
CREATE POLICY "clients_update_own" ON public.clients
  FOR UPDATE USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "clients_delete_own" ON public.clients;
CREATE POLICY "clients_delete_own" ON public.clients
  FOR DELETE USING (user_id = public.effective_uid());

-- ── DOCUMENTS ────────────────────
DROP POLICY IF EXISTS "documents_select_own" ON public.documents;
CREATE POLICY "documents_select_own" ON public.documents
  FOR SELECT USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "documents_insert_own" ON public.documents;
CREATE POLICY "documents_insert_own" ON public.documents
  FOR INSERT WITH CHECK (user_id = public.effective_uid());

DROP POLICY IF EXISTS "documents_update_own" ON public.documents;
CREATE POLICY "documents_update_own" ON public.documents
  FOR UPDATE USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "documents_delete_own" ON public.documents;
CREATE POLICY "documents_delete_own" ON public.documents
  FOR DELETE USING (user_id = public.effective_uid());

-- ── DOCUMENT TEMPLATES ───────────
DROP POLICY IF EXISTS "Users can view their own templates and system templates" ON public.document_templates;
CREATE POLICY "Users can view their own templates and system templates" ON public.document_templates
  FOR SELECT USING (user_id = public.effective_uid() OR is_system = true OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own templates" ON public.document_templates;
CREATE POLICY "Users can insert their own templates" ON public.document_templates
  FOR INSERT WITH CHECK (user_id = public.effective_uid());

DROP POLICY IF EXISTS "Users can update their own templates" ON public.document_templates;
CREATE POLICY "Users can update their own templates" ON public.document_templates
  FOR UPDATE USING (user_id = public.effective_uid());

-- ── LEADS ────────────────────────
DROP POLICY IF EXISTS "leads_select_own" ON public.leads;
CREATE POLICY "leads_select_own" ON public.leads
  FOR SELECT USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "leads_insert_own" ON public.leads;
CREATE POLICY "leads_insert_own" ON public.leads
  FOR INSERT WITH CHECK (user_id = public.effective_uid());

DROP POLICY IF EXISTS "leads_update_own" ON public.leads;
CREATE POLICY "leads_update_own" ON public.leads
  FOR UPDATE USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "leads_delete_own" ON public.leads;
CREATE POLICY "leads_delete_own" ON public.leads
  FOR DELETE USING (user_id = public.effective_uid());

-- ── TIME ENTRIES ─────────────────
DROP POLICY IF EXISTS "time_entries_select_own" ON public.time_entries;
CREATE POLICY "time_entries_select_own" ON public.time_entries
  FOR SELECT USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "time_entries_insert_own" ON public.time_entries;
CREATE POLICY "time_entries_insert_own" ON public.time_entries
  FOR INSERT WITH CHECK (user_id = public.effective_uid());

DROP POLICY IF EXISTS "time_entries_update_own" ON public.time_entries;
CREATE POLICY "time_entries_update_own" ON public.time_entries
  FOR UPDATE USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "time_entries_delete_own" ON public.time_entries;
CREATE POLICY "time_entries_delete_own" ON public.time_entries
  FOR DELETE USING (user_id = public.effective_uid());

-- ── FINANCIAL TRANSACTIONS ───────
DROP POLICY IF EXISTS "financial_select_own" ON public.financial_transactions;
CREATE POLICY "financial_select_own" ON public.financial_transactions
  FOR SELECT USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "financial_insert_own" ON public.financial_transactions;
CREATE POLICY "financial_insert_own" ON public.financial_transactions
  FOR INSERT WITH CHECK (user_id = public.effective_uid());

DROP POLICY IF EXISTS "financial_update_own" ON public.financial_transactions;
CREATE POLICY "financial_update_own" ON public.financial_transactions
  FOR UPDATE USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "financial_delete_own" ON public.financial_transactions;
CREATE POLICY "financial_delete_own" ON public.financial_transactions
  FOR DELETE USING (user_id = public.effective_uid());

-- ── AUDIENCES (calendar events) ──
DROP POLICY IF EXISTS "audiences_select_own" ON public.audiences;
CREATE POLICY "audiences_select_own" ON public.audiences
  FOR SELECT USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "audiences_insert_own" ON public.audiences;
CREATE POLICY "audiences_insert_own" ON public.audiences
  FOR INSERT WITH CHECK (user_id = public.effective_uid());

DROP POLICY IF EXISTS "audiences_update_own" ON public.audiences;
CREATE POLICY "audiences_update_own" ON public.audiences
  FOR UPDATE USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "audiences_delete_own" ON public.audiences;
CREATE POLICY "audiences_delete_own" ON public.audiences
  FOR DELETE USING (user_id = public.effective_uid());

-- ── FAVORITE LAWS ────────────────
DROP POLICY IF EXISTS "favorite_laws_select_own" ON public.favorite_laws;
CREATE POLICY "favorite_laws_select_own" ON public.favorite_laws
  FOR SELECT USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "favorite_laws_insert_own" ON public.favorite_laws;
CREATE POLICY "favorite_laws_insert_own" ON public.favorite_laws
  FOR INSERT WITH CHECK (user_id = public.effective_uid());

DROP POLICY IF EXISTS "favorite_laws_delete_own" ON public.favorite_laws;
CREATE POLICY "favorite_laws_delete_own" ON public.favorite_laws
  FOR DELETE USING (user_id = public.effective_uid());

-- ── FAVORITE PROCESSES ────────────
DROP POLICY IF EXISTS "favorite_processes_select_own" ON public.favorite_processes;
CREATE POLICY "favorite_processes_select_own" ON public.favorite_processes
  FOR SELECT USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "favorite_processes_insert_own" ON public.favorite_processes;
CREATE POLICY "favorite_processes_insert_own" ON public.favorite_processes
  FOR INSERT WITH CHECK (user_id = public.effective_uid());

DROP POLICY IF EXISTS "favorite_processes_delete_own" ON public.favorite_processes;
CREATE POLICY "favorite_processes_delete_own" ON public.favorite_processes
  FOR DELETE USING (user_id = public.effective_uid());

-- ── SEARCH HISTORY ────────────────
DROP POLICY IF EXISTS "search_history_select_own" ON public.search_history;
CREATE POLICY "search_history_select_own" ON public.search_history
  FOR SELECT USING (user_id = public.effective_uid());

DROP POLICY IF EXISTS "search_history_insert_own" ON public.search_history;
CREATE POLICY "search_history_insert_own" ON public.search_history
  FOR INSERT WITH CHECK (user_id = public.effective_uid());
