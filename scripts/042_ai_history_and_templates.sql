-- Table for private history of AI generations
CREATE TABLE IF NOT EXISTS public.ai_generated_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  process_id UUID REFERENCES public.processes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL, -- petition, contract, etc
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_generated_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist before creating
DROP POLICY IF EXISTS "users_see_own_history" ON public.ai_generated_documents;
DROP POLICY IF EXISTS "users_insert_own_history" ON public.ai_generated_documents;
DROP POLICY IF EXISTS "users_delete_own_history" ON public.ai_generated_documents;
DROP POLICY IF EXISTS "users_contribute_templates" ON public.document_templates;

-- Policies for private history
CREATE POLICY "users_see_own_history" ON public.ai_generated_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_history" ON public.ai_generated_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_history" ON public.ai_generated_documents FOR DELETE USING (auth.uid() = user_id);

-- Policy for community template contributions
CREATE POLICY "users_contribute_templates" ON public.document_templates 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Knowledge Base Expansion index
CREATE INDEX IF NOT EXISTS idx_ai_generated_docs_user_id ON public.ai_generated_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_docs_type ON public.ai_generated_documents(type);
