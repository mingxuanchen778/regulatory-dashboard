/**
 * Execute RLS Policy Fix via Supabase Management API
 */

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

// 提取项目 ref
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

console.log('🚀 Executing RLS Policy Fix...\n');
console.log(`📦 Project: ${projectRef}`);

// SQL 语句
const sql = `
-- 删除旧的更新策略
DROP POLICY IF EXISTS "Only admins can update templates" ON global_templates;

-- 创建新的更新策略：所有人可以更新 download_count
CREATE POLICY "Anyone can update download count"
  ON global_templates
  FOR UPDATE
  USING (true);
`;

console.log('\n📄 SQL to execute:');
console.log('='.repeat(60));
console.log(sql);
console.log('='.repeat(60));

// 使用 Management API 执行 SQL
const apiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

console.log('\n🔄 Executing SQL via Management API...');

fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query: sql })
})
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`HTTP ${response.status}: ${text}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('\n✅ SQL executed successfully!');
    console.log('📊 Result:', JSON.stringify(data, null, 2));
    console.log('\n🎉 RLS policy has been updated!');
    console.log('📋 Next steps:');
    console.log('   1. Refresh your browser (Ctrl+F5 or Cmd+Shift+R)');
    console.log('   2. Test the download function again');
    console.log('   3. Check that download_count updates successfully');
  })
  .catch(error => {
    console.error('\n❌ Error executing SQL:', error.message);
    console.log('\n⚠️  Please execute the SQL manually in Supabase Dashboard:');
    console.log('   1. Open: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
    console.log('   2. Copy and paste the SQL above');
    console.log('   3. Click "Run"');
    process.exit(1);
  });

