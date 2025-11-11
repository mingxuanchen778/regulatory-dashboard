-- =====================================================
-- Migration: Create Templates Storage Bucket
-- Description: 创建 templates Storage bucket 并配置 RLS 策略
-- Created: 2025-01-11
-- =====================================================

-- =====================================================
-- 1. 创建 Storage Bucket
-- =====================================================

-- 插入 templates bucket（如果不存在）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'templates',
  'templates',
  true,  -- public bucket，允许公开访问
  52428800,  -- 50MB 文件大小限制
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']  -- 允许 PDF, DOCX, DOC
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];

-- =====================================================
-- 2. 配置 RLS 策略
-- =====================================================

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Public read access for templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete templates" ON storage.objects;

-- 策略 1: 允许所有用户（包括未登录用户）读取 templates bucket 中的文件
CREATE POLICY "Public read access for templates"
ON storage.objects FOR SELECT
USING (bucket_id = 'templates');

-- 策略 2: 允许已认证用户上传文件到 templates bucket
CREATE POLICY "Authenticated users can upload templates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'templates' 
  AND auth.role() = 'authenticated'
);

-- 策略 3: 允许已认证用户更新 templates bucket 中的文件
CREATE POLICY "Authenticated users can update templates"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'templates' 
  AND auth.role() = 'authenticated'
);

-- 策略 4: 允许已认证用户删除 templates bucket 中的文件
CREATE POLICY "Authenticated users can delete templates"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'templates' 
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- 3. 验证配置
-- =====================================================

-- 查询 bucket 配置
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'templates';

-- 查询 RLS 策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects' 
  AND policyname LIKE '%templates%'
ORDER BY policyname;

-- =====================================================
-- 迁移完成
-- =====================================================

COMMENT ON TABLE storage.buckets IS 'Storage buckets configuration - templates bucket created for global template files';

