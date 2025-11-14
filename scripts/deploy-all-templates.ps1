# =====================================================
# All Templates 功能一键部署脚本
# =====================================================
# 
# 此脚本自动执行以下操作：
# 1. 验证环境配置
# 2. 运行数据库迁移
# 3. 上传文件到 Supabase Storage
# 4. 验证部署结果
#
# 使用方法：
# .\scripts\deploy-all-templates.ps1
# =====================================================

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  All Templates 功能一键部署脚本                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# =====================================================
# 步骤1：验证环境配置
# =====================================================

Write-Host "📋 步骤1：验证环境配置..." -ForegroundColor Yellow
Write-Host ""

# 检查 .env.local 文件是否存在
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ 错误：.env.local 文件不存在" -ForegroundColor Red
    Write-Host "   请创建 .env.local 文件并配置以下环境变量：" -ForegroundColor Red
    Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Red
    Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Red
    Write-Host "   - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Red
    exit 1
}

Write-Host "✅ .env.local 文件存在" -ForegroundColor Green

# 检查源文件目录是否存在
$sourceDir = "D:\AI\创业项目\FDA\reports_v2"
if (-not (Test-Path $sourceDir)) {
    Write-Host "❌ 错误：源文件目录不存在: $sourceDir" -ForegroundColor Red
    Write-Host "   请确保6个PDF文件存在于该目录" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 源文件目录存在: $sourceDir" -ForegroundColor Green

# 检查源文件是否存在
$requiredFiles = @(
    "510(k) Premarket Notification Template.pdf",
    "ind-application-template-2024.pdf",
    "EU MDR Technical Documentation Template.pdf",
    "pma-application-template-2024.pdf",
    "nda-application-template-2024.pdf",
    "EU Clinical Evaluation Report Template.pdf"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $sourceDir $file
    if (-not (Test-Path $filePath)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ 错误：以下文件缺失：" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    exit 1
}

Write-Host "✅ 所有6个源文件存在" -ForegroundColor Green
Write-Host ""

# =====================================================
# 步骤2：运行数据库迁移
# =====================================================

Write-Host "📋 步骤2：运行数据库迁移..." -ForegroundColor Yellow
Write-Host ""

Write-Host "⚠️  注意：此步骤需要手动执行" -ForegroundColor Yellow
Write-Host ""
Write-Host "请选择以下方式之一执行数据库迁移：" -ForegroundColor Cyan
Write-Host ""
Write-Host "方式1：使用 Supabase CLI（推荐）" -ForegroundColor Cyan
Write-Host "   npx supabase db push" -ForegroundColor White
Write-Host ""
Write-Host "方式2：手动在 Supabase Dashboard 执行" -ForegroundColor Cyan
Write-Host "   1. 打开 Supabase Dashboard" -ForegroundColor White
Write-Host "   2. 进入 SQL Editor" -ForegroundColor White
Write-Host "   3. 复制并执行以下文件的内容：" -ForegroundColor White
Write-Host "      supabase/migrations/20251114_add_all_templates_with_external_links.sql" -ForegroundColor White
Write-Host ""

$continue = Read-Host "数据库迁移是否已完成？(y/n)"
if ($continue -ne "y") {
    Write-Host "❌ 部署已取消" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 数据库迁移已完成" -ForegroundColor Green
Write-Host ""

# =====================================================
# 步骤3：上传文件到 Supabase Storage
# =====================================================

Write-Host "📋 步骤3：上传文件到 Supabase Storage..." -ForegroundColor Yellow
Write-Host ""

# 检查 Node.js 是否安装
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误：Node.js 未安装" -ForegroundColor Red
    Write-Host "   请安装 Node.js: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# 检查依赖是否安装
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 安装依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 错误：依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ 依赖安装成功" -ForegroundColor Green
}

# 运行上传脚本
Write-Host "⬆️  开始上传文件..." -ForegroundColor Yellow
Write-Host ""

node scripts/upload-all-templates.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ 错误：文件上传失败" -ForegroundColor Red
    Write-Host "   请检查错误信息并重试" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ 文件上传成功" -ForegroundColor Green
Write-Host ""

# =====================================================
# 步骤4：验证部署结果
# =====================================================

Write-Host "📋 步骤4：验证部署结果..." -ForegroundColor Yellow
Write-Host ""

Write-Host "请手动验证以下内容：" -ForegroundColor Cyan
Write-Host ""
Write-Host "数据库验证：" -ForegroundColor Yellow
Write-Host "  1. 打开 Supabase Dashboard" -ForegroundColor White
Write-Host "  2. 进入 SQL Editor" -ForegroundColor White
Write-Host "  3. 执行以下查询：" -ForegroundColor White
Write-Host ""
Write-Host "     -- 查询所有非精选模板（应该有9条记录）" -ForegroundColor Gray
Write-Host "     SELECT COUNT(*) as all_templates_count" -ForegroundColor Gray
Write-Host "     FROM global_templates" -ForegroundColor Gray
Write-Host "     WHERE is_featured = false;" -ForegroundColor Gray
Write-Host ""
Write-Host "     -- 查询所有模板总数（应该有14条记录）" -ForegroundColor Gray
Write-Host "     SELECT COUNT(*) as total_templates_count" -ForegroundColor Gray
Write-Host "     FROM global_templates;" -ForegroundColor Gray
Write-Host ""

Write-Host "存储验证：" -ForegroundColor Yellow
Write-Host "  1. 打开 Supabase Dashboard" -ForegroundColor White
Write-Host "  2. 进入 Storage" -ForegroundColor White
Write-Host "  3. 选择 'templates' bucket" -ForegroundColor White
Write-Host "  4. 进入 'all-templates' 文件夹" -ForegroundColor White
Write-Host "  5. 确认6个PDF文件已上传" -ForegroundColor White
Write-Host ""

Write-Host "前端验证：" -ForegroundColor Yellow
Write-Host "  1. 启动开发服务器: npm run dev" -ForegroundColor White
Write-Host "  2. 访问 http://localhost:3000" -ForegroundColor White
Write-Host "  3. 点击 'Global Templates Library' 按钮" -ForegroundColor White
Write-Host "  4. 验证以下内容：" -ForegroundColor White
Write-Host "     - Featured Templates 显示5个模板" -ForegroundColor Gray
Write-Host "     - All Templates 显示9个模板" -ForegroundColor Gray
Write-Host "     - 文件下载功能正常" -ForegroundColor Gray
Write-Host "     - 外部链接跳转功能正常" -ForegroundColor Gray
Write-Host "     - 搜索和筛选功能正常" -ForegroundColor Gray
Write-Host ""

# =====================================================
# 完成
# =====================================================

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  部署完成！                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📚 相关文档：" -ForegroundColor Cyan
Write-Host "   - 设置指南: docs/ALL_TEMPLATES_SETUP.md" -ForegroundColor White
Write-Host "   - 实施总结: IMPLEMENTATION_SUMMARY.md" -ForegroundColor White
Write-Host "   - 项目历史: docs/PROJECT_HISTORY.md" -ForegroundColor White
Write-Host ""

Write-Host "🎉 All Templates 功能已成功部署！" -ForegroundColor Green
Write-Host ""

