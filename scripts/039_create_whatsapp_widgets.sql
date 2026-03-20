-- Create WhatsApp Widgets Configuration Table
CREATE TABLE IF NOT EXISTS public.whatsapp_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  default_message TEXT DEFAULT 'Olá, vim pelo site e gostaria de mais informações.',
  call_to_action TEXT DEFAULT 'Fale com o Doutor',
  button_color TEXT DEFAULT '#25D366',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.whatsapp_widgets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "whatsapp_widgets_select_own" ON public.whatsapp_widgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "whatsapp_widgets_insert_own" ON public.whatsapp_widgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "whatsapp_widgets_update_own" ON public.whatsapp_widgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "whatsapp_widgets_delete_own" ON public.whatsapp_widgets FOR DELETE USING (auth.uid() = user_id);

-- Also allow public read access if we want the JS script to fetch it anonymously (or we can bypass RLS in the server-side API using Service Role)
-- Using Service Role in the API is safer so we don't expose user_id directly to public RLS if not needed, but since it's just public widget config, we could allow read by user_id.
-- Let's stick to Service Role in the API to keep it simple and secure.

-- Add missing trigger for updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_widgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_whatsapp_widgets_updated_at ON public.whatsapp_widgets;
CREATE TRIGGER trigger_whatsapp_widgets_updated_at
BEFORE UPDATE ON public.whatsapp_widgets
FOR EACH ROW
EXECUTE FUNCTION update_whatsapp_widgets_updated_at();

SELECT 'Script 039_create_whatsapp_widgets.sql executado com sucesso!' as status;
