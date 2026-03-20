-- =============================================
-- Migration 091: Create Interns Management Table
-- =============================================
-- Allows lawyers (advogados) to create and manage
-- intern accounts with granular permission control.

CREATE TABLE IF NOT EXISTS public.interns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- The lawyer who owns/manages this intern
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- The Supabase Auth user linked to this intern (created automatically)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Intern details
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  oab_student TEXT,        -- OAB estudantil (if applicable)
  university TEXT,         -- Faculdade
  semester TEXT,           -- Semestre atual
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active',  -- active, inactive, suspended
  
  -- Granular permissions (JSONB for flexibility)
  -- Each key is a module slug, value is boolean
  permissions JSONB NOT NULL DEFAULT '{
    "dashboard": true,
    "processes": true,
    "kanban": true,
    "deadlines": true,
    "calendar": true,
    "documents": true,
    "templates": false,
    "ai_writer": true,
    "ai_analysis": true,
    "laws": true,
    "tools": true,
    "timesheet": true,
    "clients": false,
    "leads": false,
    "financial": false,
    "reports": false,
    "subscription": true,
    "settings": true
  }'::jsonb,
  
  -- Metadata
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_interns_owner_id ON public.interns(owner_id);
CREATE INDEX IF NOT EXISTS idx_interns_user_id ON public.interns(user_id);
CREATE INDEX IF NOT EXISTS idx_interns_email ON public.interns(email);
CREATE INDEX IF NOT EXISTS idx_interns_status ON public.interns(status);

-- Unique constraint: one email per owner
CREATE UNIQUE INDEX IF NOT EXISTS idx_interns_owner_email ON public.interns(owner_id, email);

-- RLS Policies
ALTER TABLE public.interns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe re-run)
DROP POLICY IF EXISTS "interns_select_own" ON public.interns;
DROP POLICY IF EXISTS "interns_insert_own" ON public.interns;
DROP POLICY IF EXISTS "interns_update_own" ON public.interns;
DROP POLICY IF EXISTS "interns_delete_own" ON public.interns;
DROP POLICY IF EXISTS "interns_select_self" ON public.interns;

-- Lawyers can see their own interns
CREATE POLICY "interns_select_own" ON public.interns
  FOR SELECT USING (auth.uid() = owner_id);

-- Lawyers can create interns
CREATE POLICY "interns_insert_own" ON public.interns
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Lawyers can update their own interns
CREATE POLICY "interns_update_own" ON public.interns
  FOR UPDATE USING (auth.uid() = owner_id);

-- Lawyers can delete their own interns
CREATE POLICY "interns_delete_own" ON public.interns
  FOR DELETE USING (auth.uid() = owner_id);

-- Also allow interns to read their own record (by user_id)
CREATE POLICY "interns_select_self" ON public.interns
  FOR SELECT USING (auth.uid() = user_id);
