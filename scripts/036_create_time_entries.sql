-- Script to create time_entries table for the Timesheet feature

CREATE TYPE time_entry_status AS ENUM ('unbilled', 'billed', 'paid');

CREATE TABLE IF NOT EXISTS public.time_entries (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    process_id UUID REFERENCES public.processes(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    billable BOOLEAN DEFAULT true,
    hourly_rate NUMERIC(10, 2),
    amount NUMERIC(12, 2),
    status time_entry_status DEFAULT 'unbilled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS policies
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own time entries" 
    ON public.time_entries FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time entries" 
    ON public.time_entries FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries" 
    ON public.time_entries FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries" 
    ON public.time_entries FOR DELETE 
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_time_entries_updated_at 
    BEFORE UPDATE ON public.time_entries 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_process_id ON public.time_entries(process_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_client_id ON public.time_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON public.time_entries(date);
