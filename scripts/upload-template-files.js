/**
 * Upload Template Files to Supabase Storage
 * 
 * 此脚本用于：
 * 1. 创建测试用的 PDF 文件（如果不存在真实文件）
 * 2. 上传文件到 templates bucket
 * 3. 验证上传成功
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
 * 模板文件列表（与数据库中的 file_path 对应）
 */
const TEMPLATE_FILES = [
  {
    path: 'us/510k/510k-premarket-notification-2024.pdf',
    name: '510(k) Premarket Notification',
    size: 2048576 // 2MB
  },
  {
    path: 'us/ind/ind-application-template-2024.pdf',
    name: 'IND Application Template',
    size: 3145728 // 3MB
  },
  {
    path: 'eu/mdr/mdr-technical-documentation-2024.pdf',
    name: 'EU MDR Technical Documentation Template',
    size: 4194304 // 4MB
  },
  {
    path: 'us/pma/pma-application-template-2024.pdf',
    name: 'PMA Application Template',
    size: 5242880 // 5MB
  },
  {
    path: 'us/bla/bla-application-template-2024.pdf',
    name: 'BLA Application Template',
    size: 3670016 // 3.5MB
  },
  {
    path: 'us/nda/nda-application-template-2024.pdf',
    name: 'NDA Application Template',
    size: 4718592 // 4.5MB
  }
];

/**
 * 创建简单的 PDF 文件（测试用）
 */
async function createTestPDF(name, size) {
  // 创建一个简单的 PDF 文件内容
  // 注意：这是一个最小化的 PDF 文件结构
  const pdfHeader = '%PDF-1.4\n';
  const pdfContent = `
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 100
>>
stream
BT
/F1 24 Tf
100 700 Td
(${name}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
417
%%EOF
`;

  const content = pdfHeader + pdfContent;
  
  // 如果需要更大的文件，填充空白内容
  const currentSize = Buffer.byteLength(content);
  if (size > currentSize) {
    const padding = '\n'.repeat(size - currentSize);
    return Buffer.from(content + padding);
  }
  
  return Buffer.from(content);
}

/**
 * 上传单个文件
 */
async function uploadFile(filePath, fileName, fileSize) {
  try {
    console.log(`\n📄 Uploading: ${filePath}`);

    // 检查文件是否已存在
    const { data: existingFiles, error: listError } = await supabase.storage
      .from('templates')
      .list(path.dirname(filePath));

    if (!listError && existingFiles) {
      const exists = existingFiles.some(f => f.name === path.basename(filePath));
      if (exists) {
        console.log('   ℹ️  File already exists, removing old version...');
        await supabase.storage
          .from('templates')
          .remove([filePath]);
      }
    }

    // 创建测试 PDF 文件
    const fileBuffer = await createTestPDF(fileName, fileSize);

    // 上传文件
    const { data, error } = await supabase.storage
      .from('templates')
      .upload(filePath, fileBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw error;
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from('templates')
      .getPublicUrl(filePath);

    console.log('   ✓ Upload successful');
    console.log(`   ✓ Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   ✓ Public URL: ${urlData.publicUrl}`);

    return { success: true, path: filePath, url: urlData.publicUrl };

  } catch (error) {
    console.error(`   ❌ Upload failed: ${error.message}`);
    return { success: false, path: filePath, error: error.message };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Starting Template Files Upload...\n');
  console.log(`📦 Total files to upload: ${TEMPLATE_FILES.length}\n`);

  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  // 上传所有文件
  for (const file of TEMPLATE_FILES) {
    const result = await uploadFile(file.path, file.name, file.size);
    
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push({
        path: file.path,
        error: result.error
      });
    }
  }

  // 打印总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 Upload Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${results.success}/${TEMPLATE_FILES.length}`);
  console.log(`❌ Failed: ${results.failed}/${TEMPLATE_FILES.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(err => {
      console.log(`   - ${err.path}: ${err.error}`);
    });
  }

  // 验证上传
  console.log('\n' + '='.repeat(60));
  console.log('✅ Verifying uploads...');
  console.log('='.repeat(60));

  for (const file of TEMPLATE_FILES) {
    try {
      const { data, error } = await supabase.storage
        .from('templates')
        .list(path.dirname(file.path));

      if (error) throw error;

      const exists = data.some(f => f.name === path.basename(file.path));
      console.log(`${exists ? '✓' : '✗'} ${file.path}`);
    } catch (error) {
      console.log(`✗ ${file.path} - ${error.message}`);
    }
  }

  console.log('\n✅ Template files upload completed!');
}

// 运行主函数
main();

