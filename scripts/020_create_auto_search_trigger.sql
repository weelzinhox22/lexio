-- Trigger para buscar publicações automaticamente quando um processo é criado
CREATE OR REPLACE FUNCTION auto_search_publications_on_process_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Chamar a API de busca de publicações quando um processo é criado
  -- Isso será feito via webhook ou função assíncrona
  -- Por enquanto, apenas logamos
  RAISE NOTICE 'Processo criado: % - Buscar publicações automaticamente', NEW.process_number;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_auto_search_publications ON public.processes;

CREATE TRIGGER trigger_auto_search_publications
  AFTER INSERT ON public.processes
  FOR EACH ROW
  WHEN (NEW.process_number IS NOT NULL)
  EXECUTE FUNCTION auto_search_publications_on_process_insert();










