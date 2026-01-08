-- Create favorite_processes table
CREATE TABLE IF NOT EXISTS favorite_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  process_number VARCHAR(20) NOT NULL,
  tribunal VARCHAR(100),
  classe VARCHAR(100),
  assunto TEXT,
  data_favorited TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, process_number),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  process_number VARCHAR(20) NOT NULL,
  tribunal VARCHAR(100),
  search_query TEXT,
  results_count INT DEFAULT 0,
  found_at BOOLEAN DEFAULT TRUE,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_favorite_processes_user_id ON favorite_processes(user_id);
CREATE INDEX idx_favorite_processes_process_number ON favorite_processes(process_number);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_searched_at ON search_history(searched_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE favorite_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Create policies for favorite_processes
CREATE POLICY "Users can view their own favorite processes" 
ON favorite_processes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite processes" 
ON favorite_processes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorite processes" 
ON favorite_processes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite processes" 
ON favorite_processes FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for search_history
CREATE POLICY "Users can view their own search history" 
ON search_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history" 
ON search_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_favorite_processes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_favorite_processes_updated_at
BEFORE UPDATE ON favorite_processes
FOR EACH ROW
EXECUTE FUNCTION update_favorite_processes_updated_at();
