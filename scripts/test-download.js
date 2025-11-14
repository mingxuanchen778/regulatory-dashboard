/**
 * Test Template Download Functionality
 * 
 * 此脚本用于测试模板文件是否可以公开访问和下载
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// 使用 anon key 创建客户端（模拟未登录用户）
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * 测试文件列表
 */
const TEST_FILES = [
  'us/510k/510k-premarket-notification-2024.pdf',
  'us/ind/ind-application-template-2024.pdf',
  'eu/mdr/mdr-technical-documentation-2024.pdf',
  'us/pma/pma-application-template-2024.pdf',
  'us/bla/bla-application-template-2024.pdf',
  'us/nda/nda-application-template-2024.pdf'
];

/**
 * 测试 HTTP 请求
 */
function testHttpRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        contentType: res.headers['content-type'],
        contentLength: res.headers['content-length']
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * 测试单个文件
 */
async function testFile(filePath) {
  console.log(`\n📄 Testing: ${filePath}`);

  try {
    // 1. 获取公开 URL
    const { data: urlData } = supabase.storage
      .from('templates')
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    console.log(`   ✓ Public URL: ${urlData.publicUrl}`);

    // 2. 测试 HTTP 访问
    const httpResult = await testHttpRequest(urlData.publicUrl);
    
    console.log(`   ✓ HTTP Status: ${httpResult.statusCode}`);
    console.log(`   ✓ Content-Type: ${httpResult.contentType}`);
    console.log(`   ✓ Content-Length: ${httpResult.contentLength} bytes`);

    if (httpResult.statusCode === 200) {
      console.log('   ✅ File is publicly accessible');
      return { success: true, path: filePath };
    } else {
      console.log(`   ❌ File is not accessible (Status: ${httpResult.statusCode})`);
      return { success: false, path: filePath, error: `HTTP ${httpResult.statusCode}` };
    }

  } catch (error) {
    console.error(`   ❌ Test failed: ${error.message}`);
    return { success: false, path: filePath, error: error.message };
  }
}

/**
 * 测试下载功能
 */
async function testDownload(filePath) {
  console.log(`\n📥 Testing download: ${filePath}`);

  try {
    // 使用 Supabase 的 download 方法
    const { data, error } = await supabase.storage
      .from('templates')
      .download(filePath);

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('No data received');
    }

    console.log(`   ✓ Download successful`);
    console.log(`   ✓ File size: ${data.size} bytes`);
    console.log(`   ✓ File type: ${data.type}`);

    return { success: true, path: filePath };

  } catch (error) {
    console.error(`   ❌ Download failed: ${error.message}`);
    return { success: false, path: filePath, error: error.message };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Starting Template Download Tests...\n');
  console.log('🔑 Using anon key (simulating unauthenticated user)\n');
  console.log(`📦 Total files to test: ${TEST_FILES.length}\n`);

  const results = {
    publicAccess: { success: 0, failed: 0, errors: [] },
    download: { success: 0, failed: 0, errors: [] }
  };

  // 测试公开访问
  console.log('='.repeat(60));
  console.log('🌐 Testing Public Access (HTTP)');
  console.log('='.repeat(60));

  for (const file of TEST_FILES) {
    const result = await testFile(file);
    
    if (result.success) {
      results.publicAccess.success++;
    } else {
      results.publicAccess.failed++;
      results.publicAccess.errors.push({
        path: file,
        error: result.error
      });
    }
  }

  // 测试下载功能
  console.log('\n' + '='.repeat(60));
  console.log('📥 Testing Download Functionality');
  console.log('='.repeat(60));

  for (const file of TEST_FILES) {
    const result = await testDownload(file);
    
    if (result.success) {
      results.download.success++;
    } else {
      results.download.failed++;
      results.download.errors.push({
        path: file,
        error: result.error
      });
    }
  }

  // 打印总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  console.log('\n🌐 Public Access (HTTP):');
  console.log(`   ✅ Successful: ${results.publicAccess.success}/${TEST_FILES.length}`);
  console.log(`   ❌ Failed: ${results.publicAccess.failed}/${TEST_FILES.length}`);

  console.log('\n📥 Download Functionality:');
  console.log(`   ✅ Successful: ${results.download.success}/${TEST_FILES.length}`);
  console.log(`   ❌ Failed: ${results.download.failed}/${TEST_FILES.length}`);

  if (results.publicAccess.errors.length > 0) {
    console.log('\n❌ Public Access Errors:');
    results.publicAccess.errors.forEach(err => {
      console.log(`   - ${err.path}: ${err.error}`);
    });
  }

  if (results.download.errors.length > 0) {
    console.log('\n❌ Download Errors:');
    results.download.errors.forEach(err => {
      console.log(`   - ${err.path}: ${err.error}`);
    });
  }

  // 最终结论
  console.log('\n' + '='.repeat(60));
  if (results.publicAccess.success === TEST_FILES.length && results.download.success === TEST_FILES.length) {
    console.log('✅ All tests passed! Download functionality is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
    
    if (results.publicAccess.failed > 0) {
      console.log('\n💡 Tip: If public access fails, you may need to:');
      console.log('   1. Configure RLS policies in Supabase Dashboard');
      console.log('   2. Run the SQL in: supabase/manual-rls-policies.sql');
    }
  }
  console.log('='.repeat(60));
}

// 运行主函数
main();

