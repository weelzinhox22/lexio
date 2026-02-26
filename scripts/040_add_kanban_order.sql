-- Add kanban_order to leads and processes for custom sorting
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS kanban_order INTEGER DEFAULT 0;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS kanban_order INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_kanban_order ON public.leads(kanban_order);
CREATE INDEX IF NOT EXISTS idx_processes_kanban_order ON public.processes(kanban_order);

-- Add a comment to describe the usage
COMMENT ON COLUMN public.leads.kanban_order IS 'Order of the lead within its status column in the Kanban view';
COMMENT ON COLUMN public.processes.kanban_order IS 'Order of the process within its status column in the Kanban view';
