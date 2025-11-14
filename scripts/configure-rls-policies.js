/**
 * Configure RLS Policies for Templates Storage
 * 
 * 此脚本通过直接执行 SQL 来配置 RLS 策略
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
 * 执行 SQL 语句
 */
async function executeSql(sql, description) {
  try {
    console.log(`\n📝 ${description}...`);
    
    const { data, error } = await supabase.rpc('query', { query_text: sql });

    if (error) {
      // 如果 RPC 函数不存在，尝试直接使用 from() 方法
      console.log('   ℹ️  RPC method not available, trying alternative approach...');
      
      // 对于 RLS 策略，我们需要使用 Supabase Management API
      // 这里我们只能记录 SQL 并建议手动执行
      console.log('   ⚠️  Please execute this SQL manually in Supabase Dashboard:');
      console.log('   ' + '-'.repeat(60));
      console.log(sql.split('\n').map(line => '   ' + line).join('\n'));
      console.log('   ' + '-'.repeat(60));
      return false;
    }

    console.log('   ✓ Success');
    return true;

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Starting RLS Policies Configuration...\n');

  const policies = [
    {
      description: 'Drop existing policies',
      sql: `
DROP POLICY IF EXISTS "Public read access for templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete templates" ON storage.objects;
      `.trim()
    },
    {
      description: 'Create public read policy',
      sql: `
CREATE POLICY "Public read access for templates"
ON storage.objects FOR SELECT
USING (bucket_id = 'templates');
      `.trim()
    },
    {
      description: 'Create authenticated upload policy',
      sql: `
CREATE POLICY "Authenticated users can upload templates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'templates' 
  AND auth.role() = 'authenticated'
);
      `.trim()
    },
    {
      description: 'Create authenticated update policy',
      sql: `
CREATE POLICY "Authenticated users can update templates"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'templates' 
  AND auth.role() = 'authenticated'
);
      `.trim()
    },
    {
      description: 'Create authenticated delete policy',
      sql: `
CREATE POLICY "Authenticated users can delete templates"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'templates' 
  AND auth.role() = 'authenticated'
);
      `.trim()
    }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const policy of policies) {
    const success = await executeSql(policy.sql, policy.description);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Configuration Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}/${policies.length}`);
  console.log(`❌ Failed: ${failCount}/${policies.length}`);

  if (failCount > 0) {
    console.log('\n⚠️  Some policies could not be configured automatically.');
    console.log('📋 Please run the SQL statements shown above in Supabase Dashboard > SQL Editor');
    console.log('📄 Or use the file: supabase/manual-rls-policies.sql');
  } else {
    console.log('\n✅ All RLS policies configured successfully!');
  }
}

// 运行主函数
main();

