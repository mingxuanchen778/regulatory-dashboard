/**
 * 批量上传 FDA 文档到 Supabase
 * 
 * 功能：
 * 1. 扫描本地文件夹中的所有文档
 * 2. 批量上传到 Supabase Storage
 * 3. 提取文本内容
 * 4. 创建数据库记录
 * 5. 生成上传报告
 * 
 * 使用方法：
 * node scripts/bulk-upload.js --source ./fda-documents --concurrency 10
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '10');
const SOURCE_DIR = process.env.SOURCE_DIR || './fda-documents';

// 支持的文件类型
const SUPPORTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'];

// 初始化 Supabase Admin 客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 统计信息
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0,
  startTime: Date.now(),
  errors: []
};

/**
 * 扫描目录，获取所有支持的文件
 */
async function scanDirectory(dir) {
  const files = [];
  
  async function scan(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await scan(dir);
  return files;
}

/**
 * 提取文本内容
 */
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    if (ext === '.pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (ext === '.txt') {
      return await fs.readFile(filePath, 'utf-8');
    } else if (ext === '.doc' || ext === '.docx') {
      // TODO: 实现 DOC/DOCX 文本提取
      // 可以使用 mammoth 或 textract 库
      console.warn(`DOC/DOCX extraction not implemented yet: ${filePath}`);
      return '';
    }
  } catch (error) {
    console.error(`Failed to extract text from ${filePath}:`, error.message);
    return '';
  }
  
  return '';
}

/**
 * 上传单个文件
 */
async function uploadFile(filePath) {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath);
  const timestamp = Date.now();
  const storagePath = `documents/${timestamp}-${fileName}`;
  
  try {
    // 1. 读取文件
    const fileBuffer = await fs.readFile(filePath);
    const fileStats = await fs.stat(filePath);
    
    // 2. 上传到 Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBuffer, {
        contentType: getMimeType(fileExt),
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    // 3. 提取文本内容
    const contentText = await extractText(filePath);
    
    // 4. 创建数据库记录
    const { data, error: dbError } = await supabase
      .from('documents')
      .insert({
        name: fileName,
        file_path: storagePath,
        file_size: fileStats.size,
        file_type: getMimeType(fileExt),
        content_text: contentText || null,
        category: inferCategory(fileName),
        tags: inferTags(fileName)
      })
      .select()
      .single();
    
    if (dbError) {
      // 如果数据库插入失败，删除已上传的文件
      await supabase.storage.from('documents').remove([storagePath]);
      throw dbError;
    }
    
    stats.success++;
    console.log(`✅ [${stats.success}/${stats.total}] Uploaded: ${fileName}`);
    
    return { success: true, data };
    
  } catch (error) {
    stats.failed++;
    stats.errors.push({
      file: fileName,
      error: error.message
    });
    console.error(`❌ [${stats.failed}] Failed: ${fileName} - ${error.message}`);
    
    return { success: false, error: error.message };
  }
}

/**
 * 获取 MIME 类型
 */
function getMimeType(ext) {
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain'
  };
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}

/**
 * 推断文档分类
 */
function inferCategory(fileName) {
  const lowerName = fileName.toLowerCase();
  
  if (lowerName.includes('warning') || lowerName.includes('recall')) {
    return 'Safety Alert';
  } else if (lowerName.includes('approval') || lowerName.includes('clearance')) {
    return 'Approval';
  } else if (lowerName.includes('guidance')) {
    return 'Guidance';
  } else if (lowerName.includes('inspection')) {
    return 'Inspection';
  }
  
  return 'General';
}

/**
 * 推断文档标签
 */
function inferTags(fileName) {
  const tags = [];
  const lowerName = fileName.toLowerCase();
  
  if (lowerName.includes('drug')) tags.push('Drug');
  if (lowerName.includes('device')) tags.push('Device');
  if (lowerName.includes('biologic')) tags.push('Biologic');
  if (lowerName.includes('food')) tags.push('Food');
  if (lowerName.includes('510k')) tags.push('510(k)');
  if (lowerName.includes('pma')) tags.push('PMA');
  
  return tags.length > 0 ? tags : null;
}

/**
 * 批量上传（带并发控制）
 */
async function bulkUpload(files) {
  const chunks = [];
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    chunks.push(files.slice(i, i + CONCURRENCY));
  }
  
  for (const chunk of chunks) {
    await Promise.all(chunk.map(file => uploadFile(file)));
  }
}

/**
 * 生成上传报告
 */
function generateReport() {
  const duration = (Date.now() - stats.startTime) / 1000;
  const successRate = ((stats.success / stats.total) * 100).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 批量上传报告');
  console.log('='.repeat(60));
  console.log(`总文件数: ${stats.total}`);
  console.log(`成功上传: ${stats.success} (${successRate}%)`);
  console.log(`上传失败: ${stats.failed}`);
  console.log(`跳过文件: ${stats.skipped}`);
  console.log(`总耗时: ${duration.toFixed(2)} 秒`);
  console.log(`平均速度: ${(stats.total / duration).toFixed(2)} 文件/秒`);
  
  if (stats.errors.length > 0) {
    console.log('\n❌ 错误列表:');
    stats.errors.forEach((err, index) => {
      console.log(`${index + 1}. ${err.file}: ${err.error}`);
    });
  }
  
  console.log('='.repeat(60) + '\n');
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始批量上传 FDA 文档...\n');
  
  // 验证环境变量
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ 错误: 缺少 Supabase 环境变量');
    console.error('请确保设置了以下环境变量:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  // 验证源目录
  try {
    await fs.access(SOURCE_DIR);
  } catch (error) {
    console.error(`❌ 错误: 源目录不存在: ${SOURCE_DIR}`);
    process.exit(1);
  }
  
  console.log(`📁 源目录: ${SOURCE_DIR}`);
  console.log(`⚡ 并发数: ${CONCURRENCY}`);
  console.log(`📄 支持的文件类型: ${SUPPORTED_EXTENSIONS.join(', ')}\n`);
  
  // 扫描文件
  console.log('🔍 扫描文件...');
  const files = await scanDirectory(SOURCE_DIR);
  stats.total = files.length;
  
  if (files.length === 0) {
    console.log('⚠️  未找到任何支持的文件');
    process.exit(0);
  }
  
  console.log(`✅ 找到 ${files.length} 个文件\n`);
  
  // 开始上传
  console.log('📤 开始上传...\n');
  await bulkUpload(files);
  
  // 生成报告
  generateReport();
}

// 运行主函数
main().catch(error => {
  console.error('❌ 致命错误:', error);
  process.exit(1);
});

