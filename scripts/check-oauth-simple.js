#!/usr/bin/env node

/**
 * 简化版 OAuth 配置检查脚本
 * 不依赖外部包，直接读取 .env.local 文件
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI 颜色代码
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function loadEnvFile() {
  try {
    const envPath = join(__dirname, '../.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return env;
  } catch (error) {
    logError(`无法读取 .env.local 文件: ${error.message}`);
    return null;
  }
}

function checkEnvironmentVariables(env) {
  logSection('1. 检查环境变量');

  if (!env) {
    logError('.env.local 文件不存在或无法读取');
    return false;
  }

  const requiredVars = {
    'NEXT_PUBLIC_SUPABASE_URL': env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  let allPresent = true;

  for (const [name, value] of Object.entries(requiredVars)) {
    if (value) {
      logSuccess(`${name}: 已配置`);
      if (name === 'NEXT_PUBLIC_SUPABASE_URL') {
        logInfo(`   URL: ${value}`);
      }
    } else {
      logError(`${name}: 未配置`);
      allPresent = false;
    }
  }

  return allPresent;
}

function checkCallbackURLs(env) {
  logSection('2. 检查回调 URL 配置');

  const supabaseUrl = env?.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    logError('无法检查回调 URL：NEXT_PUBLIC_SUPABASE_URL 未配置');
    return;
  }

  // 提取项目 ID
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (!projectId) {
    logError('无法从 URL 中提取项目 ID');
    return;
  }

  logInfo(`项目 ID: ${projectId}`);
  
  console.log('\n需要在 Supabase Dashboard 中配置的 URL：');
  console.log('\n📍 Site URL:');
  log('   生产环境: https://mycq.ai', 'yellow');
  log('   开发环境: http://localhost:3000', 'yellow');
  
  console.log('\n📍 Redirect URLs (每个都要添加):');
  const redirectUrls = [
    'https://mycq.ai/auth/callback',
    'https://mycq.ai/auth/confirm',
    'http://localhost:3000/auth/callback',
    'http://localhost:3000/auth/confirm',
  ];
  
  redirectUrls.forEach(url => {
    log(`   ${url}`, 'yellow');
  });

  console.log('\n📍 OAuth 提供商回调 URL:');
  log(`   ${supabaseUrl}/auth/v1/callback`, 'yellow');
  logInfo('这个 URL 需要添加到 Google Cloud Console 和 Azure Portal 中');
}

function provideConfigurationSteps() {
  logSection('3. 配置步骤');

  console.log('\n🔧 Supabase Dashboard 配置:');
  console.log('   1. 访问: https://supabase.com/dashboard');
  console.log('   2. 选择项目: regulatory-dashboard');
  console.log('   3. 进入: Authentication → URL Configuration');
  console.log('   4. 设置 Site URL 和 Redirect URLs（见上方列表）');
  console.log('   5. 点击 Save 保存');

  console.log('\n🔧 Google OAuth 配置:');
  console.log('   1. 访问: https://console.cloud.google.com/apis/credentials');
  console.log('   2. 选择 OAuth 2.0 客户端 ID');
  console.log('   3. 在 "Authorized redirect URIs" 中添加 Supabase 回调 URL');
  console.log('   4. 保存更改');

  console.log('\n🔧 Microsoft OAuth 配置:');
  console.log('   1. 访问: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade');
  console.log('   2. 选择应用注册');
  console.log('   3. 进入: Authentication → Platform configurations → Web');
  console.log('   4. 在 "Redirect URIs" 中添加 Supabase 回调 URL');
  console.log('   5. 保存更改');
}

function provideTestingSteps() {
  logSection('4. 测试步骤');

  console.log('\n🧪 测试登录流程:');
  console.log('   1. 清除浏览器缓存和 Cookies');
  console.log('   2. 访问: https://mycq.ai/login 或 http://localhost:3000/login');
  console.log('   3. 点击 "Sign in with Google" 或 "Sign in with Microsoft"');
  console.log('   4. 完成授权');
  console.log('   5. 检查是否成功跳转到 dashboard');

  console.log('\n🔍 检查 Console 日志:');
  console.log('   1. 打开浏览器开发者工具 (F12)');
  console.log('   2. 查看 Console 标签');
  console.log('   3. 应该看到详细的调试信息:');
  log('      === OAuth Callback Debug Info ===', 'yellow');
  log('      Full URL: http://localhost:3000/auth/callback?code=...', 'yellow');
  log('      Search params: { code: "..." }', 'yellow');
  log('      ================================', 'yellow');
}

function checkConfigurationStatus(env) {
  logSection('5. 配置状态检查');

  console.log('\n根据你提供的截图，我看到：');
  
  logSuccess('Supabase Dashboard 配置:');
  console.log('   ✅ 已添加 https://mycq.ai');
  console.log('   ✅ 已添加 https://regulatory-dashboard-6cd0gh8t6-nick-chens-projects-7ec069ca.vercel.app/');
  console.log('   ✅ 已添加 https://mycq.ai/auth/callback');
  console.log('   ✅ 已添加 https://mycq.ai/auth/confirm');
  console.log('   ✅ 已添加 http://localhost:3000/auth/callback');
  console.log('   ✅ 已添加 http://localhost:3000/auth/confirm');
  
  logSuccess('\nGoogle OAuth 配置:');
  console.log('   ✅ 已添加 https://zzilbkehuxvbajupambt.supabase.co/auth/v1/callback');
  console.log('   ✅ 已添加 http://localhost:3000/auth/callback');
  
  logSuccess('\nMicrosoft OAuth 配置:');
  console.log('   ✅ 已添加 https://zzilbkehuxvbajupambt.supabase.co/auth/v1/callback');
  
  console.log('\n');
  logInfo('所有配置看起来都正确！');
  logInfo('现在可以进行测试了。');
}

async function main() {
  console.log('\n');
  log('🔍 OAuth 配置检查工具（简化版）', 'cyan');
  log('检查 Supabase OAuth 配置和环境变量', 'cyan');

  // 1. 加载环境变量
  const env = loadEnvFile();

  // 2. 检查环境变量
  const envOk = checkEnvironmentVariables(env);

  if (!envOk) {
    console.log('\n');
    logError('环境变量配置不完整，请先配置 .env.local 文件');
    process.exit(1);
  }

  // 3. 检查回调 URL
  checkCallbackURLs(env);

  // 4. 提供配置步骤
  provideConfigurationSteps();

  // 5. 提供测试步骤
  provideTestingSteps();

  // 6. 检查配置状态
  checkConfigurationStatus(env);

  // 总结
  logSection('总结');
  logSuccess('✅ 环境变量配置正确');
  logSuccess('✅ Supabase Dashboard 配置已完成（根据截图）');
  logSuccess('✅ OAuth 提供商配置已完成（根据截图）');
  logInfo('📝 下一步：运行本地开发服务器并测试登录流程');
  
  console.log('\n📚 相关文档:');
  console.log('   - docs/OAUTH_CALLBACK_FIX.md');
  console.log('   - docs/OAUTH_FIX_SUMMARY.md');
  console.log('\n');
}

// 运行主函数
main().catch(error => {
  console.error('\n');
  logError(`脚本执行失败: ${error.message}`);
  console.error(error);
  process.exit(1);
});

