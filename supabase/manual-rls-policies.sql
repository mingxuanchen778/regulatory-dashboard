-- =====================================================
-- Manual RLS Policies for Templates Storage
-- =====================================================
-- 请在 Supabase Dashboard > SQL Editor 中运行此脚本
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

-- 验证策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects' 
  AND policyname LIKE '%templates%'
ORDER BY policyname;

