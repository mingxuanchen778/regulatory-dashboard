/**
 * Upload All Templates Files to Supabase Storage
 * 
 * 此脚本用于：
 * 1. 从 D:\AI\创业项目\FDA\reports_v2 文件夹读取6个真实的 PDF 文件
 * 2. 上传文件到 templates bucket 的 all-templates 子目录
 * 3. 验证上传成功
 * 4. 跳过3个外部链接模板（无需上传文件）
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  console.error('   Please check .env.local file');
  process.exit(1);
}

// 使用 service role key 创建客户端（具有完整权限）
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * 源文件路径（Windows绝对路径）
 */
const SOURCE_DIR = 'D:\\AI\\创业项目\\FDA\\reports_v2';

/**
 * 文件映射列表（6个文件下载模板）
 * 注意：3个外部链接模板无需上传文件
 */
const TEMPLATE_FILES = [
  {
    sourceName: '510(k) Premarket Notification Template.pdf',
    storagePath: 'all-templates/510k-premarket-notification-template.pdf',
    title: '510(k) Premarket Notification Template',
    expectedSize: 40512
  },
  {
    sourceName: 'ind-application-template-2024.pdf',
    storagePath: 'all-templates/ind-application-template-2024.pdf',
    title: 'IND Application Template',
    expectedSize: 345163
  },
  {
    sourceName: 'EU MDR Technical Documentation Template.pdf',
    storagePath: 'all-templates/eu-mdr-technical-documentation-template.pdf',
    title: 'EU MDR Technical Documentation Template',
    expectedSize: 48239
  },
  {
    sourceName: 'pma-application-template-2024.pdf',
    storagePath: 'all-templates/pma-application-template-2024.pdf',
    title: 'PMA Application Template',
    expectedSize: 97124
  },
  {
    sourceName: 'nda-application-template-2024.pdf',
    storagePath: 'all-templates/nda-application-template-2024.pdf',
    title: 'NDA Submission Template',
    expectedSize: 3532049
  },
  {
    sourceName: 'EU Clinical Evaluation Report Template.pdf',
    storagePath: 'all-templates/eu-clinical-evaluation-report-template.pdf',
    title: 'EU Clinical Evaluation Report Template',
    expectedSize: 268419
  }
];

/**
 * 上传单个文件
 */
async function uploadFile(fileInfo) {
  try {
    console.log(`\n📄 Processing: ${fileInfo.title}`);
    console.log(`   Source: ${fileInfo.sourceName}`);
    console.log(`   Storage: ${fileInfo.storagePath}`);

    // 1. 读取本地文件
    const fullPath = path.join(SOURCE_DIR, fileInfo.sourceName);
    
    // 检查文件是否存在
    try {
      await fs.access(fullPath);
    } catch (error) {
      throw new Error(`Local file not found: ${fullPath}`);
    }

    // 读取文件内容和大小
    const fileBuffer = await fs.readFile(fullPath);
    const fileSize = fileBuffer.length;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
    
    console.log(`   ✓ File read successfully (${fileSizeMB} MB, ${fileSize} bytes)`);

    // 验证文件大小
    if (fileSize !== fileInfo.expectedSize) {
      console.warn(`   ⚠️  Warning: File size mismatch!`);
      console.warn(`      Expected: ${fileInfo.expectedSize} bytes`);
      console.warn(`      Actual: ${fileSize} bytes`);
    }

    // 2. 检查 Storage 中是否已存在该文件
    const { data: existingFiles, error: listError } = await supabase.storage
      .from('templates')
      .list('all-templates', {
        search: path.basename(fileInfo.storagePath)
      });

    if (listError) {
      console.warn(`   ⚠️  Warning: Could not check existing files: ${listError.message}`);
    }

    // 3. 如果文件已存在，先删除
    if (existingFiles && existingFiles.length > 0) {
      console.log(`   ℹ️  File already exists, removing old version...`);
      const { error: removeError } = await supabase.storage
        .from('templates')
        .remove([fileInfo.storagePath]);

      if (removeError) {
        console.warn(`   ⚠️  Warning: Could not remove old file: ${removeError.message}`);
      } else {
        console.log(`   ✓ Old file removed`);
      }
    }

    // 4. 上传新文件
    console.log(`   ⬆️  Uploading to Supabase Storage...`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('templates')
      .upload(fileInfo.storagePath, fileBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log(`   ✅ Upload successful!`);
    console.log(`   📍 Storage path: ${uploadData.path}`);

    // 5. 获取公共URL
    const { data: urlData } = supabase.storage
      .from('templates')
      .getPublicUrl(fileInfo.storagePath);

    console.log(`   🔗 Public URL: ${urlData.publicUrl}`);

    return {
      success: true,
      path: uploadData.path,
      url: urlData.publicUrl,
      size: fileSize
    };

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Upload All Templates Files to Supabase Storage           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📂 Source Directory: ${SOURCE_DIR}`);
  console.log(`📦 Total Files to Upload: ${TEMPLATE_FILES.length}`);
  console.log(`🎯 Target Bucket: templates/all-templates/`);
  console.log('');

  const results = [];

  // 逐个上传文件
  for (const fileInfo of TEMPLATE_FILES) {
    const result = await uploadFile(fileInfo);
    results.push({
      title: fileInfo.title,
      ...result
    });
  }

  // 打印总结
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Upload Summary                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successCount}/${TEMPLATE_FILES.length}`);
  console.log(`❌ Failed: ${failCount}/${TEMPLATE_FILES.length}`);
  console.log('');

  if (failCount > 0) {
    console.log('Failed uploads:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  ❌ ${r.title}: ${r.error}`);
    });
    console.log('');
  }

  console.log('📝 Note: 3 external link templates do not require file uploads:');
  console.log('   - Health Canada Medical Device License Application');
  console.log('   - De Novo Classification Request Template');
  console.log('   - TGA Conformity Assessment Template');
  console.log('');

  if (successCount === TEMPLATE_FILES.length) {
    console.log('🎉 All files uploaded successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run the database migration to insert template records');
    console.log('2. Verify templates appear in the Global Templates Library');
    console.log('3. Test download functionality for each template');
  } else {
    console.log('⚠️  Some uploads failed. Please check the errors above.');
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

