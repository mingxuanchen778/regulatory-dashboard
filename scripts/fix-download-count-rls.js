/**
 * Fix Download Count RLS Policy
 * 
 * 此脚本用于修复 download_count 更新权限问题
 * 允许所有用户（包括未登录用户）更新 download_count 字段
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// 使用 service role key 创建客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Starting RLS Policy Fix...\n');

  try {
    // 读取 SQL 文件
    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251111_fix_download_count_rls.sql');
    const sql = await fs.readFile(sqlPath, 'utf-8');

    console.log('📄 SQL to execute:');
    console.log('='.repeat(60));
    console.log(sql);
    console.log('='.repeat(60));

    console.log('\n⚠️  This script cannot execute SQL directly.');
    console.log('📋 Please execute the SQL above in Supabase Dashboard > SQL Editor\n');

    console.log('Or follow these steps:');
    console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project: regulatory-dashboard');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy and paste the SQL above');
    console.log('5. Click "Run"');

    console.log('\n✅ After running the SQL, refresh your browser and test the download function again.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main();

