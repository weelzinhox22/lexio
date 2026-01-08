-- Adicionar campo para URL do PJe
ALTER TABLE public.jusbrasil_publications 
ADD COLUMN IF NOT EXISTS pje_url TEXT;

-- Comentário explicativo
COMMENT ON COLUMN public.jusbrasil_publications.pje_url IS 'URL para acessar o processo no PJe ou sistema do tribunal';

