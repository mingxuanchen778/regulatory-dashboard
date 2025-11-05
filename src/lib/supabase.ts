/**
 * Supabase 客户端配置（防御性懒加载）
 *
 * 变更要点：
 * - 不在模块顶层抛错或创建客户端，避免初始化阶段白屏
 * - 导出 getSupabase() 按需创建客户端（仅使用 anon key）
 * - 仅在服务端导出 supabaseAdmin，客户端不打包 service role key
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const isServer = typeof window === 'undefined';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient: SupabaseClient | null = null;

/**
 * 懒加载客户端实例（仅使用 anon key，适用于客户端）
 */
export function getSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase public env missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return browserClient;
}

/**
 * 管理员 Supabase 实例（仅服务端可用）
 * 使用 service role key，绕过 RLS，切勿在客户端使用
 */
const ADMIN_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin: SupabaseClient | undefined =
  isServer && ADMIN_URL && SERVICE_ROLE_KEY
    ? createClient(ADMIN_URL, SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : undefined;

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

