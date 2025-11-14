/**
 * Delete BLA Application Template
 * 
 * 此脚本用于：
 * 1. 从数据库 global_templates 表中删除 BLA Application Template 记录
 * 2. 从 Supabase Storage templates bucket 中删除相关文件
 * 3. 提供详细的执行日志和验证
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

// BLA 模板的标识信息
const BLA_TEMPLATE = {
  filePath: 'us/bla/bla-application-template-2024.pdf',
  category: 'bla',
  title: 'BLA Application Template'
};

/**
 * 删除数据库记录
 */
async function deleteDatabaseRecord() {
  console.log('\n📊 Step 1: Deleting Database Record...');
  console.log('-'.repeat(60));

  try {
    // 先查询记录以确认存在
    const { data: existingRecord, error: queryError } = await supabase
      .from('global_templates')
      .select('*')
      .eq('file_path', BLA_TEMPLATE.filePath)
      .single();

    if (queryError) {
      if (queryError.code === 'PGRST116') {
        console.log('ℹ️  No BLA template record found in database');
        return { success: true, skipped: true };
      }
      throw queryError;
    }

    console.log('✓ Found BLA template record:');
    console.log(`   ID: ${existingRecord.id}`);
    console.log(`   Title: ${existingRecord.title}`);
    console.log(`   Category: ${existingRecord.category}`);
    console.log(`   File Path: ${existingRecord.file_path}`);
    console.log(`   Download Count: ${existingRecord.download_count}`);

    // 执行删除
    console.log('\n⏳ Deleting record from database...');
    const { error: deleteError } = await supabase
      .from('global_templates')
      .delete()
      .eq('file_path', BLA_TEMPLATE.filePath);

    if (deleteError) {
      throw deleteError;
    }

    console.log('✅ Database record deleted successfully');
    return { 
      success: true, 
      deleted: true,
      recordId: existingRecord.id 
    };

  } catch (error) {
    console.error('❌ Failed to delete database record:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * 删除 Storage 文件
 */
async function deleteStorageFile() {
  console.log('\n📦 Step 2: Deleting Storage File...');
  console.log('-'.repeat(60));

  try {
    // 先检查文件是否存在
    const { data: files, error: listError } = await supabase.storage
      .from('templates')
      .list('us/bla');

    if (listError) {
      if (listError.message.includes('not found') || listError.message.includes('does not exist')) {
        console.log('ℹ️  Directory us/bla/ does not exist in Storage');
        return { success: true, skipped: true };
      }
      throw listError;
    }

    const blaFile = files.find(f => f.name === 'bla-application-template-2024.pdf');
    
    if (!blaFile) {
      console.log('ℹ️  No BLA template file found in Storage');
      return { success: true, skipped: true };
    }

    console.log('✓ Found BLA template file:');
    console.log(`   Name: ${blaFile.name}`);
    console.log(`   Size: ${blaFile.metadata?.size || 'unknown'} bytes`);
    console.log(`   Path: ${BLA_TEMPLATE.filePath}`);

    // 执行删除
    console.log('\n⏳ Deleting file from Storage...');
    const { error: removeError } = await supabase.storage
      .from('templates')
      .remove([BLA_TEMPLATE.filePath]);

    if (removeError) {
      throw removeError;
    }

    console.log('✅ Storage file deleted successfully');
    return { 
      success: true, 
      deleted: true,
      fileName: blaFile.name,
      fileSize: blaFile.metadata?.size
    };

  } catch (error) {
    console.error('❌ Failed to delete storage file:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * 验证删除结果
 */
async function verifyDeletion() {
  console.log('\n✅ Step 3: Verifying Deletion...');
  console.log('-'.repeat(60));

  const results = {
    database: false,
    storage: false
  };

  // 验证数据库
  try {
    const { data: dbRecord, error: dbError } = await supabase
      .from('global_templates')
      .select('id')
      .eq('file_path', BLA_TEMPLATE.filePath)
      .single();

    if (dbError && dbError.code === 'PGRST116') {
      console.log('✓ Database: BLA template record not found (deleted successfully)');
      results.database = true;
    } else if (dbRecord) {
      console.log('✗ Database: BLA template record still exists!');
      results.database = false;
    }
  } catch (error) {
    console.log('✗ Database verification error:', error.message);
  }

  // 验证 Storage
  try {
    const { data: files, error: listError } = await supabase.storage
      .from('templates')
      .list('us/bla');

    if (listError || !files || files.length === 0) {
      console.log('✓ Storage: BLA template file not found (deleted successfully)');
      results.storage = true;
    } else {
      const blaFile = files.find(f => f.name === 'bla-application-template-2024.pdf');
      if (!blaFile) {
        console.log('✓ Storage: BLA template file not found (deleted successfully)');
        results.storage = true;
      } else {
        console.log('✗ Storage: BLA template file still exists!');
        results.storage = false;
      }
    }
  } catch (error) {
    console.log('✗ Storage verification error:', error.message);
  }

  // 列出剩余的模板
  console.log('\n📋 Remaining Templates in Database:');
  console.log('-'.repeat(60));

  try {
    const { data: allTemplates, error: allError } = await supabase
      .from('global_templates')
      .select('id, title, category, file_path')
      .order('id', { ascending: true });

    if (allError) {
      console.error('❌ Error listing templates:', allError.message);
    } else {
      console.log(`Total templates: ${allTemplates.length}\n`);
      allTemplates.forEach((template, index) => {
        console.log(`${index + 1}. ${template.title} (${template.category})`);
        console.log(`   Path: ${template.file_path}`);
      });
    }
  } catch (error) {
    console.error('❌ Error listing templates:', error.message);
  }

  return results;
}

/**
 * 主函数
 */
async function main() {
  console.log('🗑️  Starting BLA Application Template Deletion...\n');
  console.log('='.repeat(60));
  console.log('⚠️  WARNING: This will permanently delete:');
  console.log('   - Database record for BLA Application Template');
  console.log('   - Storage file: us/bla/bla-application-template-2024.pdf');
  console.log('='.repeat(60));

  const results = {
    database: null,
    storage: null,
    verification: null
  };

  // 步骤 1: 删除数据库记录
  results.database = await deleteDatabaseRecord();

  // 步骤 2: 删除 Storage 文件
  results.storage = await deleteStorageFile();

  // 步骤 3: 验证删除结果
  results.verification = await verifyDeletion();

  // 打印总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 Deletion Summary');
  console.log('='.repeat(60));

  // 数据库结果
  if (results.database.success) {
    if (results.database.skipped) {
      console.log('📊 Database: No record to delete (already clean)');
    } else if (results.database.deleted) {
      console.log(`✅ Database: Record deleted (ID: ${results.database.recordId})`);
    }
  } else {
    console.log(`❌ Database: Deletion failed - ${results.database.error}`);
  }

  // Storage 结果
  if (results.storage.success) {
    if (results.storage.skipped) {
      console.log('📦 Storage: No file to delete (already clean)');
    } else if (results.storage.deleted) {
      console.log(`✅ Storage: File deleted (${results.storage.fileName}, ${results.storage.fileSize} bytes)`);
    }
  } else {
    console.log(`❌ Storage: Deletion failed - ${results.storage.error}`);
  }

  // 验证结果
  console.log('\n📋 Verification Results:');
  console.log(`   Database: ${results.verification.database ? '✅ Clean' : '❌ Still exists'}`);
  console.log(`   Storage: ${results.verification.storage ? '✅ Clean' : '❌ Still exists'}`);

  console.log('\n' + '='.repeat(60));
  if (results.verification.database && results.verification.storage) {
    console.log('🎉 BLA Application Template deleted successfully!');
    console.log('✅ The template will no longer appear in Global Templates Library');
  } else {
    console.log('⚠️  Deletion completed with some issues. Please check the logs above.');
  }
  console.log('='.repeat(60));
}

// 运行主函数
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

