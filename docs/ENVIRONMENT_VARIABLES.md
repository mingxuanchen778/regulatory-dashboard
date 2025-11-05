# 🔐 Regulatory Dashboard - 环境变量完整配置指南

## 📋 目录

1. [环境变量概览](#环境变量概览)
2. [开发环境配置](#开发环境配置)
3. [Vercel 生产环境配置](#vercel-生产环境配置)
4. [批量上传脚本配置](#批量上传脚本配置)
5. [环境变量验证](#环境变量验证)
6. [安全最佳实践](#安全最佳实践)
7. [故障排除](#故障排除)

---

## 环境变量概览

### 当前使用的环境变量

| 变量名 | 类型 | 必需 | 用途 | 使用位置 |
|--------|------|------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | 客户端 | ✅ 是 | Supabase 项目 URL | 所有环境 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 客户端 | ✅ 是 | Supabase 公开密钥 | 所有环境 |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务端 | ✅ 是 | Supabase 服务端密钥 | API 路由、批量上传 |
| `OPENAI_API_KEY` | 服务端 | ⏳ 未来 | OpenAI API 密钥 | 向量嵌入、RAG |
| `SOURCE_DIR` | 脚本 | ❌ 否 | 批量上传源目录 | 批量上传脚本 |
| `CONCURRENCY` | 脚本 | ❌ 否 | 批量上传并发数 | 批量上传脚本 |

### 变量类型说明

#### 客户端变量（`NEXT_PUBLIC_*`）
- ✅ 会被打包到客户端代码中
- ✅ 可以在浏览器中访问
- ⚠️ 不应包含敏感信息
- 📍 使用位置：React 组件、客户端代码

#### 服务端变量（无 `NEXT_PUBLIC_` 前缀）
- ✅ 仅在服务器端可用
- ✅ 不会暴露给客户端
- ✅ 可以包含敏感信息
- 📍 使用位置：API 路由、服务器组件、脚本

---

## 开发环境配置

### 1. 创建 `.env.local` 文件

```bash
# 复制模板文件
cp .env.local.example .env.local
```

### 2. 填写环境变量

编辑 `.env.local` 文件：

```bash
# Supabase 配置（必需）
NEXT_PUBLIC_SUPABASE_URL=https://zzilbkehuxvbajupambt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6aWxia2VodXh2YmFqdXBhbWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzcwNDUsImV4cCI6MjA3Nzg1MzA0NX0.sO70nzYVIy1FZaVQKPvG1Q_AO0lTGVCyvJkHFCCoSgY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6aWxia2VodXh2YmFqdXBhbWJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI3NzA0NSwiZXhwIjoyMDc3ODUzMDQ1fQ.XewSyg7xekPJ3B7QvFtiaEHBXYj7mYR1-EJbLO1eHME

# OpenAI 配置（可选 - 未来功能）
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 验证配置

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
# 检查浏览器控制台是否有环境变量错误
```

### 4. 获取 Supabase 凭证

#### 方式 1：通过 Supabase Dashboard

1. 访问 https://supabase.com/dashboard
2. 选择项目：`regulatory-dashboard`
3. 进入 Settings → API
4. 复制以下信息：
   - **Project URL**：`NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**：`NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret**：`SUPABASE_SERVICE_ROLE_KEY`

#### 方式 2：通过 Supabase CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 获取项目信息
supabase projects list

# 获取 API 密钥
supabase projects api-keys --project-ref zzilbkehuxvbajupambt
```

---

## Vercel 生产环境配置

### 1. 连接 GitHub 仓库到 Vercel

1. 访问 https://vercel.com/dashboard
2. 点击 "Add New Project"
3. 选择 GitHub 仓库：`mingxuanchen778/regulatory-dashboard`
4. 点击 "Import"

### 2. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 方式 1：通过 Vercel Dashboard

1. 进入项目 → Settings → Environment Variables
2. 添加以下变量：

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zzilbkehuxvbajupambt.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |

3. 点击 "Save"
4. 触发重新部署

#### 方式 2：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 链接项目
vercel link

# 添加环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
# 输入值：https://zzilbkehuxvbajupambt.supabase.co
# 选择环境：Production, Preview, Development

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# 输入值：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# 选择环境：Production, Preview, Development

vercel env add SUPABASE_SERVICE_ROLE_KEY
# 输入值：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# 选择环境：Production, Preview, Development

# 部署到生产环境
vercel --prod
```

#### 方式 3：通过 `.env` 文件导入

```bash
# 创建 vercel.env 文件（不要提交到 Git）
cat > vercel.env << EOF
NEXT_PUBLIC_SUPABASE_URL=https://zzilbkehuxvbajupambt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF

# 导入环境变量
vercel env pull .env.vercel
```

### 3. 环境变量应用范围

| 环境 | 说明 | 用途 |
|------|------|------|
| **Production** | 生产环境 | 主分支（main）部署 |
| **Preview** | 预览环境 | Pull Request 预览 |
| **Development** | 开发环境 | 本地开发（`vercel dev`） |

**推荐配置**：
- ✅ 所有环境使用相同的 Supabase 项目（开发阶段）
- ✅ 生产环境使用独立的 Supabase 项目（上线后）

### 4. 验证 Vercel 部署

```bash
# 查看部署状态
vercel ls

# 查看环境变量
vercel env ls

# 查看部署日志
vercel logs
```

---

## 批量上传脚本配置

### 1. 基本用法

批量上传脚本会自动读取 `.env.local` 文件中的环境变量：

```bash
# 使用默认配置
npm run bulk-upload
```

### 2. 自定义配置

通过命令行参数覆盖默认值：

```bash
# 指定源目录
SOURCE_DIR=./my-documents npm run bulk-upload

# 指定并发数
CONCURRENCY=20 npm run bulk-upload

# 组合使用
SOURCE_DIR=./fda-documents CONCURRENCY=15 npm run bulk-upload
```

### 3. 环境变量说明

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 无 | Supabase URL（必需） |
| `SUPABASE_SERVICE_ROLE_KEY` | 无 | Service Role Key（必需） |
| `SOURCE_DIR` | `./fda-documents` | 源文档目录 |
| `CONCURRENCY` | `10` | 并发上传数量 |

### 4. 脚本环境变量验证

批量上传脚本会在启动时验证必需的环境变量：

```javascript
// scripts/bulk-upload.js (第 269-275 行)
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 错误: 缺少 Supabase 环境变量');
  console.error('请确保设置了以下环境变量:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
```

---

## 环境变量验证

### 1. 代码中的验证

#### `src/lib/supabase.ts`（第 12-17 行）

```typescript
// 验证环境变量
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
```

**状态**：✅ 已实现
**覆盖范围**：客户端必需变量

#### `scripts/bulk-upload.js`（第 269-275 行）

```javascript
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 错误: 缺少 Supabase 环境变量');
  process.exit(1);
}
```

**状态**：✅ 已实现
**覆盖范围**：批量上传脚本必需变量

### 2. 改进建议

#### 建议 1：创建统一的环境变量验证模块

创建 `src/lib/env.ts`：

```typescript
/**
 * 环境变量验证和类型定义
 */

// 必需的环境变量
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

// 可选的环境变量
const optionalEnvVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
] as const;

// 验证环境变量
export function validateEnv() {
  const missing: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}`
    );
  }
}

// 类型安全的环境变量访问
export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
} as const;

// 在应用启动时验证
validateEnv();
```

#### 建议 2：添加运行时环境变量检查

创建 `src/app/api/health/route.ts`：

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  const envStatus = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    openaiApiKey: !!process.env.OPENAI_API_KEY,
  };
  
  const allRequired = envStatus.supabaseUrl && 
                      envStatus.supabaseAnonKey && 
                      envStatus.supabaseServiceKey;
  
  return NextResponse.json({
    status: allRequired ? 'healthy' : 'unhealthy',
    environment: envStatus,
  });
}
```

---

## 安全最佳实践

### 1. 密钥管理

#### ✅ 应该做的

- ✅ 使用 `.env.local` 存储本地开发密钥
- ✅ 将 `.env.local` 添加到 `.gitignore`
- ✅ 在 Vercel Dashboard 中配置生产环境密钥
- ✅ 定期轮换 API 密钥（每 3-6 个月）
- ✅ 为不同环境使用不同的密钥

#### ❌ 不应该做的

- ❌ 将密钥提交到 Git 仓库
- ❌ 在客户端代码中使用 Service Role Key
- ❌ 在公开的文档或截图中暴露密钥
- ❌ 与他人共享密钥（使用团队功能）
- ❌ 在日志中打印密钥

### 2. Supabase 安全配置

#### RLS 策略

```sql
-- 当前状态：Public Access（仅用于开发）
-- 生产环境必须配置 RLS 策略

-- 运行 scripts/setup-auth-rls.sql 配置生产环境 RLS
```

#### API 密钥权限

| 密钥类型 | 权限 | 使用场景 |
|---------|------|----------|
| **Anon Key** | 受 RLS 保护 | 客户端操作 |
| **Service Role Key** | 绕过 RLS，完全权限 | 服务器端、批量上传 |

### 3. 监控和告警

#### Supabase 使用监控

1. 访问 Supabase Dashboard → Settings → Usage
2. 设置使用量告警：
   - Storage 使用量 > 80%
   - Database 使用量 > 80%
   - API 请求异常增长

#### Vercel 部署监控

1. 访问 Vercel Dashboard → Analytics
2. 监控：
   - 部署失败率
   - 环境变量错误
   - API 响应时间

---

## 故障排除

### 问题 1：环境变量未定义

**错误信息**：
```
Error: Missing env.NEXT_PUBLIC_SUPABASE_URL
```

**解决方案**：
1. 检查 `.env.local` 文件是否存在
2. 确认变量名称拼写正确（区分大小写）
3. 重启开发服务器：`npm run dev`
4. 清除 Next.js 缓存：`rm -rf .next`

### 问题 2：Vercel 部署失败

**错误信息**：
```
Build Error: Environment variable not found
```

**解决方案**：
1. 检查 Vercel Dashboard 中的环境变量配置
2. 确认环境变量应用到正确的环境（Production/Preview/Development）
3. 触发重新部署：`vercel --prod`

### 问题 3：批量上传脚本失败

**错误信息**：
```
❌ 错误: 缺少 Supabase 环境变量
```

**解决方案**：
1. 确认 `.env.local` 文件存在
2. 检查 `NEXT_PUBLIC_SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY`
3. 使用绝对路径运行脚本：
   ```bash
   cd d:\AI\创业项目\FDA\mycq.ai\regulatory-dashboard
   npm run bulk-upload
   ```

### 问题 4：Service Role Key 暴露在客户端

**错误信息**：
```
Warning: Service Role Key detected in client bundle
```

**解决方案**：
1. 检查是否在客户端组件中使用了 `supabaseAdmin`
2. 确保 Service Role Key 仅在 API 路由或服务器组件中使用
3. 使用 `supabase`（anon key）而不是 `supabaseAdmin` 在客户端

---

## 总结

### 当前配置状态

| 项目 | 状态 | 说明 |
|------|------|------|
| 开发环境 `.env.local` | ✅ 已配置 | 包含所有必需变量 |
| Vercel 环境变量 | ⏳ 待配置 | 需要手动在 Dashboard 中添加 |
| 环境变量验证 | ✅ 已实现 | `src/lib/supabase.ts` 和 `scripts/bulk-upload.js` |
| 安全配置 | ⚠️ 部分完成 | RLS 策略待配置（生产环境） |

### 下一步行动

1. ✅ 复制 `.env.local.example` 为 `.env.local`（如果还没有）
2. ⏳ 在 Vercel Dashboard 中配置环境变量
3. ⏳ 测试批量上传脚本
4. ⏳ 配置生产环境 RLS 策略（第 5-6 周）

---

**文档版本**：v1.0  
**最后更新**：2025-01-06  
**维护者**：Regulatory Dashboard Team

