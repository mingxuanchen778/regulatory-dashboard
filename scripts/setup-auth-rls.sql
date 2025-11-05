-- ============================================================
-- Regulatory Dashboard - 用户认证和 RLS 策略配置
-- ============================================================
-- 
-- 这个脚本配置了完整的用户认证和基于角色的权限系统
-- 
-- 角色定义：
-- - admin: 系统管理员（完全控制权限）
-- - content_manager: 内容管理员（可以上传和管理文档）
-- - user: 普通用户（只读权限）
-- 
-- 使用方法：
-- 1. 在 Supabase Dashboard 的 SQL Editor 中运行此脚本
-- 2. 或使用 Supabase CLI: supabase db push
-- ============================================================

-- ============================================================
-- 第 1 部分：创建用户角色表
-- ============================================================

-- 创建用户角色表
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'content_manager', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 启用 RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的角色
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 只有管理员可以管理角色
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================
-- 第 2 部分：创建辅助函数
-- ============================================================

-- 获取当前用户角色的函数
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER;

-- 检查用户是否是管理员
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- 检查用户是否是内容管理员或管理员
CREATE OR REPLACE FUNCTION public.can_manage_content(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid AND role IN ('admin', 'content_manager')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================
-- 第 3 部分：更新 documents 表
-- ============================================================

-- 添加 uploaded_by 字段（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'uploaded_by'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN uploaded_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);

-- ============================================================
-- 第 4 部分：配置 documents 表的 RLS 策略
-- ============================================================

-- 删除旧的 public access 策略（如果存在）
DROP POLICY IF EXISTS "Public Access" ON public.documents;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.documents;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.documents;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.documents;

-- 启用 RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 策略 1：所有认证用户可以查看文档
CREATE POLICY "Authenticated users can view documents"
ON public.documents FOR SELECT
TO authenticated
USING (true);

-- 策略 2：内容管理员和管理员可以上传文档
CREATE POLICY "Content managers can upload documents"
ON public.documents FOR INSERT
TO authenticated
WITH CHECK (
  public.can_manage_content(auth.uid())
);

-- 策略 3：用户可以更新自己上传的文档，管理员可以更新所有文档
CREATE POLICY "Users can update their own documents"
ON public.documents FOR UPDATE
TO authenticated
USING (
  uploaded_by = auth.uid() OR public.is_admin(auth.uid())
)
WITH CHECK (
  uploaded_by = auth.uid() OR public.is_admin(auth.uid())
);

-- 策略 4：用户可以删除自己上传的文档，管理员可以删除所有文档
CREATE POLICY "Users can delete their own documents"
ON public.documents FOR DELETE
TO authenticated
USING (
  uploaded_by = auth.uid() OR public.is_admin(auth.uid())
);

-- ============================================================
-- 第 5 部分：配置 Storage 的 RLS 策略
-- ============================================================

-- 删除旧的 public access 策略
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- 策略 1：所有认证用户可以读取文档
CREATE POLICY "Authenticated users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- 策略 2：内容管理员和管理员可以上传文档
CREATE POLICY "Content managers can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  public.can_manage_content(auth.uid())
);

-- 策略 3：用户可以更新自己上传的文档，管理员可以更新所有文档
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (owner = auth.uid() OR public.is_admin(auth.uid()))
);

-- 策略 4：用户可以删除自己上传的文档，管理员可以删除所有文档
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (owner = auth.uid() OR public.is_admin(auth.uid()))
);

-- ============================================================
-- 第 6 部分：创建触发器（自动设置 uploaded_by）
-- ============================================================

-- 创建触发器函数
CREATE OR REPLACE FUNCTION public.set_uploaded_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.uploaded_by IS NULL THEN
    NEW.uploaded_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS set_uploaded_by_trigger ON public.documents;
CREATE TRIGGER set_uploaded_by_trigger
BEFORE INSERT ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_uploaded_by();

-- ============================================================
-- 第 7 部分：创建初始管理员账号（示例）
-- ============================================================

-- 注意：这只是示例，实际使用时应该通过 Supabase Dashboard 创建用户
-- 然后手动插入角色记录

-- 示例：为已存在的用户分配管理员角色
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('your-user-uuid-here', 'admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- ============================================================
-- 第 8 部分：验证配置
-- ============================================================

-- 查看所有策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('documents', 'user_roles')
ORDER BY tablename, policyname;

-- 查看 Storage 策略
SELECT *
FROM storage.policies
WHERE bucket_id = 'documents'
ORDER BY name;

-- ============================================================
-- 完成！
-- ============================================================

-- 下一步：
-- 1. 在 Supabase Dashboard 中创建用户账号
-- 2. 为用户分配角色（插入到 user_roles 表）
-- 3. 测试权限隔离
-- 4. 更新前端代码以支持用户认证

COMMENT ON TABLE public.user_roles IS '用户角色表：管理用户权限';
COMMENT ON FUNCTION public.get_user_role IS '获取用户角色';
COMMENT ON FUNCTION public.is_admin IS '检查用户是否是管理员';
COMMENT ON FUNCTION public.can_manage_content IS '检查用户是否可以管理内容';

