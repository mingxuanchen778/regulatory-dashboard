# 🚀 环境变量快速参考卡片

## 📋 必需的环境变量（3 个）

### 1. NEXT_PUBLIC_SUPABASE_URL
```bash
NEXT_PUBLIC_SUPABASE_URL=https://zzilbkehuxvbajupambt.supabase.co
```
- **类型**：客户端变量
- **用途**：Supabase 项目 URL
- **获取**：Supabase Dashboard → Settings → API → Project URL
- **环境**：所有环境（开发、预览、生产）

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **类型**：客户端变量
- **用途**：Supabase 公开密钥（受 RLS 保护）
- **获取**：Supabase Dashboard → Settings → API → anon public
- **环境**：所有环境（开发、预览、生产）
- **安全**：可以安全暴露在客户端

### 3. SUPABASE_SERVICE_ROLE_KEY
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **类型**：服务端变量
- **用途**：Supabase 服务端密钥（绕过 RLS，完全权限）
- **获取**：Supabase Dashboard → Settings → API → service_role secret
- **环境**：所有环境（开发、预览、生产）
- **⚠️ 警告**：切勿暴露在客户端代码中！

---

## 🔧 可选的环境变量

### 4. OPENAI_API_KEY（未来功能）
```bash
OPENAI_API_KEY=sk-proj-...
```
- **类型**：服务端变量
- **用途**：OpenAI API 密钥（向量嵌入、RAG）
- **获取**：https://platform.openai.com/api-keys
- **状态**：当前未使用，未来功能需要

### 5. SOURCE_DIR（批量上传脚本）
```bash
SOURCE_DIR=./fda-documents
```
- **类型**：脚本变量
- **用途**：批量上传源目录
- **默认值**：`./fda-documents`
- **使用**：`SOURCE_DIR=./my-docs npm run bulk-upload`

### 6. CONCURRENCY（批量上传脚本）
```bash
CONCURRENCY=15
```
- **类型**：脚本变量
- **用途**：批量上传并发数
- **默认值**：`10`
- **推荐值**：5-20
- **使用**：`CONCURRENCY=20 npm run bulk-upload`

---

## 📝 快速配置步骤

### 开发环境（本地）

```bash
# 1. 复制模板文件
cp .env.local.example .env.local

# 2. 编辑 .env.local，填写以下 3 个必需变量：
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY

# 3. 启动开发服务器
npm run dev
```

### Vercel 生产环境

```bash
# 方式 1：通过 Vercel Dashboard
# 1. 访问 https://vercel.com/dashboard
# 2. 选择项目 → Settings → Environment Variables
# 3. 添加 3 个必需变量
# 4. 选择所有环境（Production, Preview, Development）
# 5. 保存并重新部署

# 方式 2：通过 Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel --prod
```

---

## 🔍 验证配置

### 检查开发环境

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
# 检查浏览器控制台是否有错误
```

### 检查 Vercel 部署

```bash
# 查看环境变量
vercel env ls

# 查看部署日志
vercel logs

# 触发重新部署
vercel --prod
```

### 检查批量上传脚本

```bash
# 测试环境变量
npm run bulk-upload:test

# 如果成功，会显示：
# 🚀 开始批量上传 FDA 文档...
# 📁 源目录: ./test-documents
# ⚡ 并发数: 5
```

---

## ⚠️ 常见错误

### 错误 1：Missing env.NEXT_PUBLIC_SUPABASE_URL

**原因**：`.env.local` 文件不存在或变量未定义

**解决**：
```bash
# 检查文件是否存在
ls -la .env.local

# 如果不存在，复制模板
cp .env.local.example .env.local

# 编辑并填写变量
```

### 错误 2：Vercel 部署失败

**原因**：Vercel 环境变量未配置

**解决**：
1. 访问 Vercel Dashboard
2. 进入项目 → Settings → Environment Variables
3. 添加 3 个必需变量
4. 触发重新部署

### 错误 3：批量上传失败

**原因**：环境变量未加载或源目录不存在

**解决**：
```bash
# 检查环境变量
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# 检查源目录
ls -la ./fda-documents

# 如果目录不存在，创建它
mkdir fda-documents
```

---

## 📚 相关文档

- **完整配置指南**：`docs/ENVIRONMENT_VARIABLES.md`
- **部署指南**：`DEPLOYMENT_GUIDE.md`
- **批量上传工具**：`scripts/README.md`
- **环境变量模板**：`.env.local.example`

---

## 🔐 安全提醒

### ✅ 应该做的
- ✅ 将 `.env.local` 添加到 `.gitignore`（已完成）
- ✅ 在 Vercel Dashboard 中配置环境变量
- ✅ 定期轮换 API 密钥
- ✅ 为不同环境使用不同的密钥

### ❌ 不应该做的
- ❌ 将密钥提交到 Git 仓库
- ❌ 在客户端代码中使用 Service Role Key
- ❌ 在公开的文档或截图中暴露密钥
- ❌ 与他人共享密钥

---

**快速参考版本**：v1.0  
**最后更新**：2025-01-06

