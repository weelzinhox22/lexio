-- ============================================
-- CRIAR BUCKET PARA LOGOS DE PAPEL TIMBRADO
-- ============================================

-- Este script deve ser executado no Supabase SQL Editor
-- Mas a criação de buckets de Storage é melhor feita pela interface

-- INSTRUÇÕES:
-- 1. Vá em Storage no Supabase Dashboard
-- 2. Clique em "Create a new bucket"
-- 3. Nome: letterheads
-- 4. Marque como "Public" (para logos serem visíveis)
-- 5. Clique em "Create bucket"

-- Depois, configure as políticas de acesso:
-- Vá em Storage > letterheads > Policies e adicione:

-- Política 1: Permitir upload (INSERT)
-- CREATE POLICY "Users can upload letterhead logos"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'letterheads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política 2: Permitir leitura (SELECT)
-- CREATE POLICY "Public can view letterhead logos"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'letterheads');

-- Política 3: Permitir atualização (UPDATE)
-- CREATE POLICY "Users can update their own letterhead logos"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'letterheads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política 4: Permitir exclusão (DELETE)
-- CREATE POLICY "Users can delete their own letterhead logos"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'letterheads' AND auth.uid()::text = (storage.foldername(name))[1]);

SELECT 'Instruções para criar bucket de letterheads exibidas. Execute manualmente no Storage.' as status;

