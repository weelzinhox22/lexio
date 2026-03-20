-- Kanban Boards Table
CREATE TABLE IF NOT EXISTS public.kanban_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#4F46E5', -- Indigo default
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kanban Columns Table
CREATE TABLE IF NOT EXISTS public.kanban_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES public.kanban_boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kanban Cards Table
CREATE TABLE IF NOT EXISTS public.kanban_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_id UUID NOT NULL REFERENCES public.kanban_columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  order_index INTEGER NOT NULL,
  due_date DATE,
  labels TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "boards_select_own" ON public.kanban_boards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "boards_insert_own" ON public.kanban_boards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "boards_update_own" ON public.kanban_boards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "boards_delete_own" ON public.kanban_boards FOR DELETE USING (auth.uid() = user_id);

-- Check board ownership for column/card access via policy based on joined user_id
CREATE POLICY "columns_access_own_board" ON public.kanban_columns FOR ALL USING (
  EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = board_id AND b.user_id = auth.uid())
);

CREATE POLICY "cards_access_own_board" ON public.kanban_cards FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.kanban_columns c
    JOIN public.kanban_boards b ON c.board_id = b.id
    WHERE c.id = column_id AND b.user_id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX idx_kanban_boards_user_id ON public.kanban_boards(user_id);
CREATE INDEX idx_kanban_columns_board_id ON public.kanban_columns(board_id);
CREATE INDEX idx_kanban_cards_column_id ON public.kanban_cards(column_id);
