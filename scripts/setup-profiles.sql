-- ============================================================
-- Regulatory Dashboard - 用户资料表（Profiles）配置
-- ============================================================
-- 
-- 这个脚本创建 profiles 表用于存储用户的扩展信息
-- 与 auth.users 表关联，提供用户昵称、头像等信息
-- 
-- 使用方法：
-- 1. 在 Supabase Dashboard 的 SQL Editor 中运行此脚本
-- 2. 或在执行 setup-auth-rls.sql 之前/之后运行
-- ============================================================

-- ============================================================
-- 第 1 部分：创建 profiles 表
-- ============================================================

-- 创建 profiles 表
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- 添加注释
COMMENT ON TABLE public.profiles IS '用户资料表：存储用户的扩展信息（昵称、头像等）';
COMMENT ON COLUMN public.profiles.id IS '用户 ID（关联 auth.users）';
COMMENT ON COLUMN public.profiles.full_name IS '用户全名/昵称';
COMMENT ON COLUMN public.profiles.avatar_url IS '用户头像 URL';

-- ============================================================
-- 第 2 部分：启用 RLS 并配置策略
-- ============================================================

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 策略 1：用户可以查看自己的资料
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 策略 2：用户可以更新自己的资料
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 策略 3：用户可以插入自己的资料（首次登录时创建）
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- ============================================================
-- 第 3 部分：创建触发器（自动更新 updated_at）
-- ============================================================

-- 创建触发器函数
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS update_profiles_updated_at_trigger ON public.profiles;
CREATE TRIGGER update_profiles_updated_at_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_profiles_updated_at();

-- ============================================================
-- 第 4 部分：创建自动创建 profile 的触发器（可选）
-- ============================================================

-- 当新用户注册时，自动创建对应的 profile 记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器（在 auth.users 表上）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 第 5 部分：验证配置
-- ============================================================

-- 查看 profiles 表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 查看 profiles 表的 RLS 策略
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- ============================================================
-- 完成！
-- ============================================================

-- 下一步：
-- 1. 执行 setup-auth-rls.sql（如果还没有执行）
-- 2. 在 Supabase Dashboard 中启用 Auth Providers
-- 3. 测试用户注册流程，验证 profile 自动创建

