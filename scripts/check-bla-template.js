/**
 * Check BLA Application Template Status
 * 
 * 此脚本用于检查：
 * 1. 数据库中是否存在 BLA Application Template 记录
 * 2. Supabase Storage 中是否存在相关文件
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

async function checkBLATemplate() {
  console.log('🔍 Checking BLA Application Template Status...\n');
  console.log('='.repeat(60));

  // 1. 检查数据库记录
  console.log('\n📊 Step 1: Checking Database Record...');
  console.log('-'.repeat(60));

  try {
    const { data: templates, error: dbError } = await supabase
      .from('global_templates')
      .select('*')
      .or('file_path.eq.us/bla/bla-application-template-2024.pdf,category.eq.bla,title.ilike.%BLA%');

    if (dbError) {
      console.error('❌ Database query error:', dbError.message);
    } else if (!templates || templates.length === 0) {
      console.log('✅ No BLA Application Template found in database');
    } else {
      console.log(`⚠️  Found ${templates.length} BLA template record(s):\n`);
      templates.forEach((template, index) => {
        console.log(`Record ${index + 1}:`);
        console.log(`   ID: ${template.id}`);
        console.log(`   Title: ${template.title}`);
        console.log(`   Category: ${template.category}`);
        console.log(`   File Path: ${template.file_path}`);
        console.log(`   File Size: ${template.file_size} bytes`);
        console.log(`   Download Count: ${template.download_count}`);
        console.log(`   Created At: ${template.created_at}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }

  // 2. 检查 Storage 文件
  console.log('\n📦 Step 2: Checking Supabase Storage...');
  console.log('-'.repeat(60));

  try {
    // 检查 us/bla/ 目录
    const { data: files, error: listError } = await supabase.storage
      .from('templates')
      .list('us/bla');

    if (listError) {
      if (listError.message.includes('not found') || listError.message.includes('does not exist')) {
        console.log('✅ Directory us/bla/ does not exist in Storage');
      } else {
        console.error('❌ Storage list error:', listError.message);
      }
    } else if (!files || files.length === 0) {
      console.log('✅ No files found in us/bla/ directory');
    } else {
      console.log(`⚠️  Found ${files.length} file(s) in us/bla/ directory:\n`);
      files.forEach((file, index) => {
        console.log(`File ${index + 1}:`);
        console.log(`   Name: ${file.name}`);
        console.log(`   Size: ${file.metadata?.size || 'unknown'} bytes`);
        console.log(`   Created: ${file.created_at}`);
        console.log(`   Updated: ${file.updated_at}`);
        console.log('');
      });

      // 检查特定文件
      const blaFile = files.find(f => f.name === 'bla-application-template-2024.pdf');
      if (blaFile) {
        console.log('⚠️  BLA template file exists: us/bla/bla-application-template-2024.pdf');
        
        // 获取公共 URL
        const { data: urlData } = supabase.storage
          .from('templates')
          .getPublicUrl('us/bla/bla-application-template-2024.pdf');
        
        console.log(`   Public URL: ${urlData.publicUrl}`);
      }
    }
  } catch (error) {
    console.error('❌ Error checking storage:', error.message);
  }

  // 3. 检查所有模板记录（用于对比）
  console.log('\n📋 Step 3: Listing All Templates in Database...');
  console.log('-'.repeat(60));

  try {
    const { data: allTemplates, error: allError } = await supabase
      .from('global_templates')
      .select('id, title, category, file_path')
      .order('id', { ascending: true });

    if (allError) {
      console.error('❌ Error listing all templates:', allError.message);
    } else {
      console.log(`Total templates in database: ${allTemplates.length}\n`);
      allTemplates.forEach((template, index) => {
        const isBLA = template.category === 'bla' || 
                      template.file_path.includes('bla') || 
                      template.title.toLowerCase().includes('bla');
        const marker = isBLA ? '⚠️ ' : '✓ ';
        console.log(`${marker}${index + 1}. ${template.title} (${template.category})`);
        console.log(`   Path: ${template.file_path}`);
      });
    }
  } catch (error) {
    console.error('❌ Error listing templates:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Status check completed!');
  console.log('='.repeat(60));
}

// 运行检查
checkBLATemplate().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

