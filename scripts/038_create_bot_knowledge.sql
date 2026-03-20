-- Create table for storing bot knowledge
CREATE TABLE IF NOT EXISTS public.bot_knowledge (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.bot_knowledge ENABLE ROW LEVEL SECURITY;

-- Policies for bot_knowledge
CREATE POLICY "Users can view active bot knowledge" 
    ON public.bot_knowledge FOR SELECT 
    USING (is_active = true);

-- Allow authenticated users to insert/update their own knowledge patterns
CREATE POLICY "Users can insert bot knowledge" 
    ON public.bot_knowledge FOR INSERT 
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own bot knowledge" 
    ON public.bot_knowledge FOR UPDATE 
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own bot knowledge" 
    ON public.bot_knowledge FOR DELETE 
    USING (auth.uid() = created_by);

-- Enable pg_trgm extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create index for faster text search
CREATE INDEX IF NOT EXISTS idx_bot_knowledge_question_trgm ON public.bot_knowledge USING gin (question gin_trgm_ops);
