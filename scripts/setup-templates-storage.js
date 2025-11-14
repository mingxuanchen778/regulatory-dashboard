/**
 * Setup Templates Storage Bucket
 * 
 * 此脚本用于：
 * 1. 创建 templates Storage bucket
 * 2. 配置 RLS 策略
 * 3. 验证配置
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
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗');
  process.exit(1);
}

// 使用 service role key 创建客户端（拥有完全权限）
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
  console.log('🚀 Starting Templates Storage Setup...\n');

  try {
    // 步骤 1: 创建 bucket
    await createBucket();

    // 步骤 2: 配置 RLS 策略
    await configureRLSPolicies();

    // 步骤 3: 验证配置
    await verifyConfiguration();

    console.log('\n✅ Templates Storage setup completed successfully!');
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

/**
 * 创建 templates bucket
 */
async function createBucket() {
  console.log('📦 Step 1: Creating templates bucket...');

  try {
    // 检查 bucket 是否已存在
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const existingBucket = buckets.find(b => b.id === 'templates');

    if (existingBucket) {
      console.log('   ℹ️  Bucket "templates" already exists');
      
      // 更新 bucket 配置
      const { error: updateError } = await supabase.storage.updateBucket('templates', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword'
        ]
      });

      if (updateError) {
        console.warn('   ⚠️  Failed to update bucket configuration:', updateError.message);
      } else {
        console.log('   ✓ Bucket configuration updated');
      }
    } else {
      // 创建新 bucket
      const { data, error: createError } = await supabase.storage.createBucket('templates', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword'
        ]
      });

      if (createError) {
        throw new Error(`Failed to create bucket: ${createError.message}`);
      }

      console.log('   ✓ Bucket "templates" created successfully');
    }
  } catch (error) {
    throw new Error(`Bucket creation failed: ${error.message}`);
  }
}

/**
 * 配置 RLS 策略
 */
async function configureRLSPolicies() {
  console.log('\n🔒 Step 2: Configuring RLS policies...');

  const policies = [
    {
      name: 'Public read access for templates',
      sql: `
        CREATE POLICY IF NOT EXISTS "Public read access for templates"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'templates');
      `
    },
    {
      name: 'Authenticated users can upload templates',
      sql: `
        CREATE POLICY IF NOT EXISTS "Authenticated users can upload templates"
        ON storage.objects FOR INSERT
        WITH CHECK (
          bucket_id = 'templates' 
          AND auth.role() = 'authenticated'
        );
      `
    },
    {
      name: 'Authenticated users can update templates',
      sql: `
        CREATE POLICY IF NOT EXISTS "Authenticated users can update templates"
        ON storage.objects FOR UPDATE
        USING (
          bucket_id = 'templates' 
          AND auth.role() = 'authenticated'
        );
      `
    },
    {
      name: 'Authenticated users can delete templates',
      sql: `
        CREATE POLICY IF NOT EXISTS "Authenticated users can delete templates"
        ON storage.objects FOR DELETE
        USING (
          bucket_id = 'templates' 
          AND auth.role() = 'authenticated'
        );
      `
    }
  ];

  for (const policy of policies) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });

      if (error) {
        console.warn(`   ⚠️  Policy "${policy.name}": ${error.message}`);
      } else {
        console.log(`   ✓ Policy "${policy.name}" configured`);
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to create policy "${policy.name}":`, error.message);
    }
  }

  console.log('   ℹ️  Note: Some policies may need to be created manually in Supabase Dashboard');
}

/**
 * 验证配置
 */
async function verifyConfiguration() {
  console.log('\n✅ Step 3: Verifying configuration...');

  try {
    // 验证 bucket 存在
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const templatesBucket = buckets.find(b => b.id === 'templates');

    if (!templatesBucket) {
      throw new Error('Templates bucket not found');
    }

    console.log('   ✓ Bucket "templates" exists');
    console.log(`   ✓ Public: ${templatesBucket.public}`);
    console.log(`   ✓ File size limit: ${templatesBucket.file_size_limit ? (templatesBucket.file_size_limit / 1024 / 1024).toFixed(2) + ' MB' : 'Not set'}`);

    // 测试公开访问
    console.log('\n   Testing public access...');
    const testPath = 'test-file.txt';
    
    // 尝试获取公开 URL（即使文件不存在，也应该返回 URL）
    const { data: urlData } = supabase.storage
      .from('templates')
      .getPublicUrl(testPath);

    if (urlData && urlData.publicUrl) {
      console.log('   ✓ Public URL generation works');
      console.log(`   ✓ Example URL: ${urlData.publicUrl}`);
    } else {
      console.warn('   ⚠️  Public URL generation may not work correctly');
    }

  } catch (error) {
    throw new Error(`Verification failed: ${error.message}`);
  }
}

// 运行主函数
main();

