/**
 * Upload Real Template Files to Supabase Storage
 * 
 * 此脚本用于：
 * 1. 从 temp-real-templates 文件夹读取真实的 PDF 文件
 * 2. 上传文件到 templates bucket（替换现有测试文件）
 * 3. 更新数据库中的 file_size 字段
 * 4. 跳过 BLA Application Template（因为没有真实文档）
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
 * 真实模板文件列表（与数据库中的 file_path 对应）
 * 注意：跳过 BLA Application Template
 */
const TEMPLATE_FILES = [
  {
    localPath: 'temp-real-templates/us/510k/510k-premarket-notification-2024.pdf',
    storagePath: 'us/510k/510k-premarket-notification-2024.pdf',
    name: '510(k) Premarket Notification'
  },
  {
    localPath: 'temp-real-templates/us/ind/ind-application-template-2024.pdf',
    storagePath: 'us/ind/ind-application-template-2024.pdf',
    name: 'IND Application Template'
  },
  {
    localPath: 'temp-real-templates/eu/mdr/mdr-technical-documentation-2024.pdf',
    storagePath: 'eu/mdr/mdr-technical-documentation-2024.pdf',
    name: 'EU MDR Technical Documentation Template'
  },
  {
    localPath: 'temp-real-templates/us/pma/pma-application-template-2024.pdf',
    storagePath: 'us/pma/pma-application-template-2024.pdf',
    name: 'PMA Application Template'
  },
  {
    localPath: 'temp-real-templates/us/nda/nda-application-template-2024.pdf',
    storagePath: 'us/nda/nda-application-template-2024.pdf',
    name: 'NDA Application Template'
  }
  // 注意：BLA Application Template 被跳过
];

/**
 * 上传单个文件
 */
async function uploadFile(localPath, storagePath, fileName) {
  try {
    console.log(`\n📄 Processing: ${fileName}`);
    console.log(`   Local: ${localPath}`);
    console.log(`   Storage: ${storagePath}`);

    // 1. 读取本地文件
    const fullPath = path.join(__dirname, '..', localPath);
    
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

    // 2. 检查 Storage 中是否已存在该文件
    const { data: existingFiles, error: listError } = await supabase.storage
      .from('templates')
      .list(path.dirname(storagePath));

    if (!listError && existingFiles) {
      const exists = existingFiles.some(f => f.name === path.basename(storagePath));
      if (exists) {
        console.log('   ℹ️  File already exists in storage, removing old version...');
        const { error: removeError } = await supabase.storage
          .from('templates')
          .remove([storagePath]);
        
        if (removeError) {
          console.log(`   ⚠️  Warning: Could not remove old file: ${removeError.message}`);
        } else {
          console.log('   ✓ Old file removed');
        }
      }
    }

    // 3. 上传新文件
    console.log('   ⏳ Uploading to Supabase Storage...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('templates')
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    console.log('   ✓ Upload successful');

    // 4. 获取公开 URL
    const { data: urlData } = supabase.storage
      .from('templates')
      .getPublicUrl(storagePath);

    console.log(`   ✓ Public URL: ${urlData.publicUrl}`);

    // 5. 更新数据库中的 file_size 字段
    console.log('   ⏳ Updating database file_size...');
    const { data: updateData, error: updateError } = await supabase
      .from('global_templates')
      .update({ file_size: fileSize })
      .eq('file_path', storagePath)
      .select();

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    if (!updateData || updateData.length === 0) {
      throw new Error(`No matching record found in database for file_path: ${storagePath}`);
    }

    console.log(`   ✓ Database updated (file_size: ${fileSize} bytes)`);
    console.log(`   ✅ Complete: ${fileName}`);

    return { 
      success: true, 
      path: storagePath, 
      url: urlData.publicUrl,
      size: fileSize,
      sizeMB: fileSizeMB
    };

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return { 
      success: false, 
      path: storagePath, 
      error: error.message 
    };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Starting Real Template Files Upload...\n');
  console.log('=' .repeat(60));
  console.log(`📦 Total files to upload: ${TEMPLATE_FILES.length}`);
  console.log('ℹ️  Note: BLA Application Template is skipped (no real document)');
  console.log('=' .repeat(60));

  const results = {
    success: 0,
    failed: 0,
    errors: [],
    uploaded: []
  };

  // 上传所有文件
  for (const file of TEMPLATE_FILES) {
    const result = await uploadFile(file.localPath, file.storagePath, file.name);
    
    if (result.success) {
      results.success++;
      results.uploaded.push({
        name: file.name,
        path: result.path,
        size: result.sizeMB,
        url: result.url
      });
    } else {
      results.failed++;
      results.errors.push({
        name: file.name,
        path: file.storagePath,
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

  if (results.uploaded.length > 0) {
    console.log('\n✅ Successfully Uploaded Files:');
    results.uploaded.forEach(file => {
      console.log(`   📄 ${file.name}`);
      console.log(`      Path: ${file.path}`);
      console.log(`      Size: ${file.size} MB`);
      console.log(`      URL: ${file.url}`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(err => {
      console.log(`   - ${err.name} (${err.path})`);
      console.log(`     Error: ${err.error}`);
    });
  }

  // 验证上传
  console.log('\n' + '='.repeat(60));
  console.log('✅ Verifying uploads in Storage...');
  console.log('='.repeat(60));

  for (const file of TEMPLATE_FILES) {
    try {
      const { data, error } = await supabase.storage
        .from('templates')
        .list(path.dirname(file.storagePath));

      if (error) throw error;

      const exists = data.some(f => f.name === path.basename(file.storagePath));
      console.log(`${exists ? '✓' : '✗'} ${file.storagePath}`);
    } catch (error) {
      console.log(`✗ ${file.storagePath} - ${error.message}`);
    }
  }

  // 验证数据库更新
  console.log('\n' + '='.repeat(60));
  console.log('✅ Verifying database updates...');
  console.log('='.repeat(60));

  for (const file of TEMPLATE_FILES) {
    try {
      const { data, error } = await supabase
        .from('global_templates')
        .select('file_path, file_size')
        .eq('file_path', file.storagePath)
        .single();

      if (error) throw error;

      const sizeMB = (data.file_size / 1024 / 1024).toFixed(2);
      console.log(`✓ ${file.storagePath}: ${sizeMB} MB (${data.file_size} bytes)`);
    } catch (error) {
      console.log(`✗ ${file.storagePath} - ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  if (results.failed === 0) {
    console.log('🎉 All real template files uploaded successfully!');
  } else {
    console.log('⚠️  Upload completed with some errors. Please check the error messages above.');
  }
  console.log('='.repeat(60));
}

// 运行主函数
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

