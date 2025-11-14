/**
 * FDA Guidance Documents CSV Import Script
 *
 * 从Google Sheets导入FDA文档数据到Supabase数据库
 *
 * 使用方法:
 *   node scripts/import-fda-guidance.js
 *
 * 环境变量:
 *   SUPABASE_URL - Supabase项目URL
 *   SUPABASE_SERVICE_KEY - Supabase服务密钥（需要写权限）
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import { randomUUID } from 'crypto';

// 加载.env.local文件
dotenv.config({ path: '.env.local' });

// Google Sheets CSV导出URL
const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/11IdsHSZQUkT2Xox0Ri0mhR2ULwVdpSUgPCQ90lJvVTQ/export?format=csv';

// 批量插入大小
const BATCH_SIZE = 100;

// 统计信息
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0,
  errors: []
};

/**
 * 解析Document列，提取标题和文件大小
 * 格式: "PDF (358.58 KB)PDF (358.58 KB) of [标题]"
 */
function parseDocumentColumn(documentStr) {
  if (!documentStr) {
    return { title: null, size: null };
  }

  // 提取标题（"of" 后面的部分）
  const titleMatch = documentStr.match(/of\s+(.+)$/);
  const title = titleMatch ? titleMatch[1].trim() : documentStr;

  // 提取文件大小（第一个括号中的内容）
  const sizeMatch = documentStr.match(/PDF\s*\(([^)]+)\)/);
  const size = sizeMatch ? sizeMatch[1] : null;

  return { title, size };
}

/**
 * 转换日期格式: MM/DD/YYYY → YYYY-MM-DD (ISO格式)
 */
function convertDateFormat(dateStr) {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }

  try {
    const [month, day, year] = dateStr.split('/');
    if (!month || !day || !year) {
      return null;
    }

    // 返回ISO格式日期（YYYY-MM-DD）
    const paddedMonth = month.padStart(2, '0');
    const paddedDay = day.padStart(2, '0');
    return `${year}-${paddedMonth}-${paddedDay}`;
  } catch (error) {
    console.error(`日期转换失败: ${dateStr}`, error.message);
    return null;
  }
}

/**
 * 解析FDA Organization，取第一个组织
 */
function parseOrganization(orgStr) {
  if (!orgStr) {
    return null;
  }

  const orgs = orgStr.split(',').map(s => s.trim());
  return orgs[0];
}

/**
 * 解析Topic，分割为数组
 */
function parseTopics(topicStr) {
  if (!topicStr || topicStr.trim() === '') {
    return [];
  }

  return topicStr
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);
}

/**
 * 基于status设置icon
 */
function mapStatusToIcon(status) {
  return status === 'Draft' ? 'edit' : 'file';
}

/**
 * 基于Docket Number构建FDA URL
 */
function buildFDAUrl(docketNumber) {
  if (!docketNumber || docketNumber.trim() === '') {
    return null;
  }

  // FDA官网URL模式（需要验证）
  return `https://www.fda.gov/regulatory-information/search-fda-guidance-documents/${docketNumber}`;
}

/**
 * 转换CSV行为数据库记录
 */
function transformRow(row, rowIndex) {
  try {
    // 解析Document列
    const { title: parsedTitle, size } = parseDocumentColumn(row.Document);

    // 如果Document列为空，使用Summary作为标题
    const title = parsedTitle && parsedTitle.trim()
      ? parsedTitle.trim()
      : (row.Summary && row.Summary.trim() ? row.Summary.trim() : 'N/A');

    // 转换日期 - 允许为空
    const issueDate = convertDateFormat(row['Issue Date']);
    if (!issueDate) {
      // 如果日期无效，记录警告但不跳过记录
      console.warn(`⚠️  行 ${rowIndex}: 日期无效或缺失，使用当前日期`);
    }

    // 解析组织 - 允许为空
    const organization = parseOrganization(row['FDA Organization']) || 'N/A';

    // 解析主题
    const topics = parseTopics(row.Topic);

    // 验证status - 允许为空，默认为Final
    let status = row['Guidance Status'];
    if (status !== 'Draft' && status !== 'Final') {
      console.warn(`⚠️  行 ${rowIndex}: 状态无效 "${status}"，默认为Final`);
      status = 'Final';
    }

    // 构建数据库记录
    return {
      id: randomUUID(),
      title: title,
      description: row.Summary || 'N/A',
      issue_date: issueDate || new Date().toISOString().split('T')[0], // 使用当前日期作为后备
      organization: organization,
      status: status,
      file_size: size || null,
      comment_period_closes: convertDateFormat(row['Comment Closing Date on Draft']),
      docket_number: row['Docket Number'] || null,
      url: buildFDAUrl(row['Docket Number']),
      topics: topics,
      source: 'google_sheets_import'
    };
  } catch (error) {
    stats.errors.push({
      row: rowIndex,
      error: error.message,
      data: row
    });
    return null;
  }
}

/**
 * 批量插入数据到Supabase
 */
async function batchInsert(supabase, records) {
  if (records.length === 0) {
    return;
  }

  try {
    const { data, error } = await supabase
      .from('fda_guidance_documents')
      .insert(records);

    if (error) {
      // 检查是否是重复键错误
      if (error.message && error.message.includes('duplicate')) {
        console.log(`⚠️  跳过 ${records.length} 条重复记录`);
        stats.skipped += records.length;
      } else {
        console.error(`❌ 批量插入失败:`, error.message);
        stats.failed += records.length;
        stats.errors.push({
          batch: true,
          error: error.message,
          count: records.length
        });
      }
    } else {
      stats.success += records.length;
      console.log(`✅ 成功插入 ${records.length} 条记录 (总计: ${stats.success})`);
    }
  } catch (error) {
    console.error(`❌ 批量插入异常:`, error.message);
    stats.failed += records.length;
    stats.errors.push({
      batch: true,
      error: error.message,
      count: records.length
    });
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始导入FDA Guidance Documents...\n');

  // 检查环境变量
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 错误: 缺少环境变量 SUPABASE_URL 或 SUPABASE_SERVICE_KEY');
    console.error('请在 .env.local 文件中设置这些变量');
    process.exit(1);
  }

  // 创建Supabase客户端
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`📥 从Google Sheets下载CSV数据...`);
  console.log(`   URL: ${GOOGLE_SHEETS_CSV_URL}\n`);

  // 使用fetch下载CSV
  const response = await fetch(GOOGLE_SHEETS_CSV_URL);
  if (!response.ok) {
    console.error(`❌ 下载失败: ${response.statusText}`);
    process.exit(1);
  }

  const csvText = await response.text();
  console.log(`✅ CSV数据下载完成 (${csvText.length} 字符)\n`);

  // 解析CSV - 跳过第一行标题
  console.log(`📊 解析CSV数据...`);

  // 先分割行，跳过第一行
  const lines = csvText.split('\n');
  console.log(`   总行数: ${lines.length}`);

  // 移除第一行（标题行）
  if (lines.length > 0 && lines[0].includes('Search for FDA Guidance Documents')) {
    console.log(`   ⏭️  跳过第一行标题: "${lines[0].substring(0, 50)}..."`);
    lines.shift();
  }

  // 重新组合CSV文本
  const cleanedCsvText = lines.join('\n');

  const parseResult = Papa.parse(cleanedCsvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });

  if (parseResult.errors.length > 0) {
    console.warn(`⚠️  CSV解析警告: ${parseResult.errors.length} 个错误`);
    parseResult.errors.slice(0, 5).forEach(err => {
      console.warn(`   - 行 ${err.row}: ${err.message}`);
    });
    console.log('');
  }

  const rows = parseResult.data;
  stats.total = rows.length;

  console.log(`✅ CSV解析完成: ${rows.length} 行数据`);
  console.log(`   列名: ${parseResult.meta.fields.join(', ')}\n`);
  console.log(`🔄 开始转换和导入数据...\n`);

  // 转换数据并批量插入
  let batch = [];
  let processedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    processedCount++;

    // 转换行数据
    const record = transformRow(row, i + 1);

    if (record) {
      batch.push(record);

      // 达到批量大小时插入
      if (batch.length >= BATCH_SIZE) {
        await batchInsert(supabase, batch);
        batch = [];
      }
    }

    // 显示进度
    if (processedCount % 100 === 0) {
      console.log(`📈 进度: ${processedCount}/${rows.length} (${Math.round(processedCount / rows.length * 100)}%)`);
    }
  }

  // 插入剩余的记录
  if (batch.length > 0) {
    await batchInsert(supabase, batch);
  }

  // 输出统计信息
  console.log('\n' + '='.repeat(60));
  console.log('📊 导入完成统计:');
  console.log('='.repeat(60));
  console.log(`总记录数:   ${stats.total}`);
  console.log(`成功导入:   ${stats.success} ✅`);
  console.log(`跳过重复:   ${stats.skipped} ⏭️`);
  console.log(`失败记录:   ${stats.failed} ❌`);
  console.log(`错误数量:   ${stats.errors.length}`);
  console.log('='.repeat(60));

  // 输出错误详情（前10个）
  if (stats.errors.length > 0) {
    console.log('\n❌ 错误详情 (前10个):');
    stats.errors.slice(0, 10).forEach((err, idx) => {
      console.log(`\n${idx + 1}. 行 ${err.row || 'N/A'}:`);
      console.log(`   错误: ${err.error}`);
      if (err.data) {
        console.log(`   数据: ${JSON.stringify(err.data).substring(0, 100)}...`);
      }
    });

    if (stats.errors.length > 10) {
      console.log(`\n... 还有 ${stats.errors.length - 10} 个错误未显示`);
    }
  }

  console.log('\n✨ 导入流程完成!\n');
}

// 运行主函数
main().catch(error => {
  console.error('\n💥 导入过程中发生致命错误:');
  console.error(error);
  process.exit(1);
});

