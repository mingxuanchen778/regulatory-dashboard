/**
 * Supabase 客户端配置
 * 
 * 这个文件提供了两个 Supabase 客户端实例：
 * 1. supabase - 用于客户端操作（使用 anon key）
 * 2. supabaseAdmin - 用于服务器端操作（使用 service role key）
 */

import { createClient } from '@supabase/supabase-js';

// 验证环境变量
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * 客户端 Supabase 实例
 * 使用 anon key，适用于客户端操作
 * 受 Row Level Security (RLS) 策略保护
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * 管理员 Supabase 实例
 * 使用 service role key，仅用于服务器端 API 路由
 * ⚠️ 警告：此客户端绕过 RLS 策略，拥有完全权限
 * 切勿在客户端代码中使用！
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * 数据库类型定义
 */
export interface Document {
  id: number;
  name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  upload_date: string;
  category?: string;
  tags?: string[];
  content_text?: string;
  embedding?: number[];
}

/**
 * 向量搜索结果类型
 */
export interface VectorSearchResult {
  id: number;
  name: string;
  content_text: string;
  similarity: number;
}

