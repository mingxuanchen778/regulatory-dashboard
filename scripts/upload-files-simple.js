/**
 * 简化版文件上传脚本
 * 使用 Supabase Management API 上传文件
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从 .env.local 读取配置
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const SUPABASE_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const SERVICE_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();

console.log('✅ 环境变量加载成功');
console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
console.log('');

// 文件映射
const files = [
  {
    source: 'D:\\AI\\创业项目\\FDA\\reports_v2\\510(k) Premarket Notification Template.pdf',
    target: 'all-templates/510k-premarket-notification-template.pdf',
    name: '510(k) Premarket Notification Template'
  },
  {
    source: 'D:\\AI\\创业项目\\FDA\\reports_v2\\ind-application-template-2024.pdf',
    target: 'all-templates/ind-application-template-2024.pdf',
    name: 'IND Application Template'
  },
  {
    source: 'D:\\AI\\创业项目\\FDA\\reports_v2\\EU MDR Technical Documentation Template.pdf',
    target: 'all-templates/eu-mdr-technical-documentation-template.pdf',
    name: 'EU MDR Technical Documentation Template'
  },
  {
    source: 'D:\\AI\\创业项目\\FDA\\reports_v2\\pma-application-template-2024.pdf',
    target: 'all-templates/pma-application-template-2024.pdf',
    name: 'PMA Application Template'
  },
  {
    source: 'D:\\AI\\创业项目\\FDA\\reports_v2\\nda-application-template-2024.pdf',
    target: 'all-templates/nda-application-template-2024.pdf',
    name: 'NDA Submission Template'
  },
  {
    source: 'D:\\AI\\创业项目\\FDA\\reports_v2\\EU Clinical Evaluation Report Template.pdf',
    target: 'all-templates/eu-clinical-evaluation-report-template.pdf',
    name: 'EU Clinical Evaluation Report Template'
  }
];

console.log(`📦 准备上传 ${files.length} 个文件`);
console.log('');

// 上传单个文件
async function uploadFile(fileInfo) {
  return new Promise((resolve, reject) => {
    console.log(`📄 处理: ${fileInfo.name}`);
    console.log(`   源文件: ${path.basename(fileInfo.source)}`);
    console.log(`   目标路径: ${fileInfo.target}`);
    
    // 检查文件是否存在
    if (!fs.existsSync(fileInfo.source)) {
      console.log(`   ❌ 文件不存在`);
      resolve({ success: false, error: 'File not found' });
      return;
    }
    
    // 读取文件
    const fileBuffer = fs.readFileSync(fileInfo.source);
    const fileSizeKB = (fileBuffer.length / 1024).toFixed(2);
    console.log(`   ✓ 文件读取成功 (${fileSizeKB} KB, ${fileBuffer.length} bytes)`);
    
    // 构建上传URL
    const projectRef = SUPABASE_URL.match(/https:\/\/(.+)\.supabase\.co/)[1];
    const uploadUrl = `https://${projectRef}.supabase.co/storage/v1/object/templates/${fileInfo.target}`;
    
    console.log(`   ⬆️  上传到 Supabase Storage...`);
    
    // 发送HTTP请求
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/pdf',
        'Content-Length': fileBuffer.length,
        'x-upsert': 'true'
      }
    };
    
    const req = https.request(uploadUrl, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`   ✅ 上传成功!`);
          console.log(`   📍 存储路径: ${fileInfo.target}`);
          console.log('');
          resolve({ success: true });
        } else {
          console.log(`   ❌ 上传失败 (状态码: ${res.statusCode})`);
          console.log(`   错误信息: ${data}`);
          console.log('');
          resolve({ success: false, error: data });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ 请求失败: ${error.message}`);
      console.log('');
      resolve({ success: false, error: error.message });
    });
    
    req.write(fileBuffer);
    req.end();
  });
}

// 主函数
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  上传 All Templates 文件到 Supabase Storage               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const file of files) {
    const result = await uploadFile(file);
    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  上传总结                                                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ 成功: ${successCount}/${files.length}`);
  console.log(`❌ 失败: ${failCount}/${files.length}`);
  console.log('');
  
  if (successCount === files.length) {
    console.log('🎉 所有文件上传成功!');
  } else {
    console.log('⚠️  部分文件上传失败，请检查错误信息');
  }
}

main().catch(console.error);

