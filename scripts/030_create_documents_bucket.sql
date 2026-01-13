-- ============================================
-- CRIAR BUCKET PARA DOCUMENTOS
-- ============================================
-- Este script cria o bucket 'documents' no Supabase Storage
-- Execute no Supabase SQL Editor

-- IMPORTANTE: A criação do bucket deve ser feita pela interface do Supabase
-- Mas as políticas podem ser criadas via SQL

-- INSTRUÇÕES PARA CRIAR O BUCKET:
-- 1. Vá em Storage no Supabase Dashboard
-- 2. Clique em "Create a new bucket"
-- 3. Nome: documents
-- 4. Marque como "Private" (documentos são privados por usuário)
-- 5. Clique em "Create bucket"

-- Depois, execute as políticas abaixo:

-- ============================================
-- POLÍTICAS DE ACESSO
-- ============================================

-- Remover políticas antigas se existirem (para evitar conflitos)
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Política 1: Permitir upload (INSERT) - Usuários autenticados podem fazer upload apenas na sua pasta
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política 2: Permitir leitura (SELECT) - Usuários autenticados podem ler apenas seus próprios documentos
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política 3: Permitir atualização (UPDATE) - Usuários autenticados podem atualizar apenas seus próprios documentos
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política 4: Permitir exclusão (DELETE) - Usuários autenticados podem deletar apenas seus próprios documentos
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verificar se as políticas foram criadas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%documents%'
ORDER BY policyname;

SELECT 'Políticas para bucket documents criadas com sucesso!' as status;

