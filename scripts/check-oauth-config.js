#!/usr/bin/env node

/**
 * OAuth 配置检查脚本
 * 
 * 用途：
 * - 检查 Supabase 环境变量配置
 * - 验证 OAuth 回调 URL 配置
 * - 提供配置建议
 */

import { createClient } from '@supabase/supabase-js';

// 注意：环境变量应该已经通过 .env.local 加载
// 如果运行此脚本时环境变量未加载，请先运行 `npm run dev` 或手动设置环境变量

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

async function checkEnvironmentVariables() {
  logSection('1. 检查环境变量');

  const requiredVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

async function checkSupabaseConnection() {
  logSection('2. 检查 Supabase 连接');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    logError('无法创建 Supabase 客户端：缺少环境变量');
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 尝试获取会话（不需要登录）
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      logWarning(`连接成功，但获取会话时出错: ${error.message}`);
      logInfo('这是正常的，因为当前没有活动会话');
    } else {
      logSuccess('Supabase 连接成功');
    }
    
    return true;
  } catch (error) {
    logError(`Supabase 连接失败: ${error.message}`);
    return false;
  }
}

function checkCallbackURLs() {
  logSection('3. 检查回调 URL 配置');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
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
  logSection('4. 配置步骤');

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
  logSection('5. 测试步骤');

  console.log('\n🧪 测试登录流程:');
  console.log('   1. 清除浏览器缓存和 Cookies');
  console.log('   2. 访问: https://mycq.ai/login');
  console.log('   3. 点击 "Sign in with Google" 或 "Sign in with Microsoft"');
  console.log('   4. 完成授权');
  console.log('   5. 检查是否成功跳转到 dashboard');

  console.log('\n🔍 检查 Console 日志:');
  console.log('   1. 打开浏览器开发者工具 (F12)');
  console.log('   2. 查看 Console 标签');
  console.log('   3. 应该看到详细的调试信息:');
  log('      === OAuth Callback Debug Info ===', 'yellow');
  log('      Full URL: https://mycq.ai/auth/callback?code=...', 'yellow');
  log('      Search params: { code: "..." }', 'yellow');
  log('      ================================', 'yellow');
}

async function main() {
  console.log('\n');
  log('🔍 OAuth 配置检查工具', 'cyan');
  log('检查 Supabase OAuth 配置和环境变量', 'cyan');

  // 1. 检查环境变量
  const envOk = await checkEnvironmentVariables();

  if (!envOk) {
    console.log('\n');
    logError('环境变量配置不完整，请先配置 .env.local 文件');
    logInfo('参考文档: docs/ENVIRONMENT_VARIABLES.md');
    process.exit(1);
  }

  // 2. 检查 Supabase 连接
  await checkSupabaseConnection();

  // 3. 检查回调 URL
  checkCallbackURLs();

  // 4. 提供配置步骤
  provideConfigurationSteps();

  // 5. 提供测试步骤
  provideTestingSteps();

  // 总结
  logSection('总结');
  logSuccess('环境变量配置正确');
  logInfo('请按照上述步骤配置 Supabase Dashboard 和 OAuth 提供商');
  logInfo('配置完成后，运行测试步骤验证登录流程');
  
  console.log('\n📚 相关文档:');
  console.log('   - docs/OAUTH_CALLBACK_FIX.md');
  console.log('   - docs/ENVIRONMENT_VARIABLES.md');
  console.log('   - docs/AUTHENTICATION_TESTING_GUIDE.md');
  console.log('\n');
}

// 运行主函数
main().catch(error => {
  console.error('\n');
  logError(`脚本执行失败: ${error.message}`);
  console.error(error);
  process.exit(1);
});

