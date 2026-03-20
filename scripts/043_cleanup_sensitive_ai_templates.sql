-- CLEANUP OF SHARED TEMPLATES WITH SENSITIVE DATA
DELETE FROM public.document_templates 
WHERE (name LIKE '%[COLABORATIVO]%' OR name LIKE '%[COLETIVO]%')
AND user_id IS NULL;

SELECT 'Templates compartilhados removidos para limpeza de dados sensíveis.' as status;
