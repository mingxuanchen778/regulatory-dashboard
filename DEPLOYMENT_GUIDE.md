# 🚀 Regulatory Dashboard 完整部署指南

## 📋 目录

1. [架构概述](#架构概述)
2. [用户角色定义](#用户角色定义)
3. [部署流程](#部署流程)
4. [批量上传文档](#批量上传文档)
5. [配置用户认证](#配置用户认证)
6. [生产环境部署](#生产环境部署)
7. [常见问题](#常见问题)

---

## 架构概述

### 系统组件

```
┌─────────────────────────────────────────────────────────────┐
│                    Regulatory Dashboard                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   前端 UI    │ ───> │  Supabase    │ ───> │  Storage  │ │
│  │  (Vercel)    │      │  (Backend)   │      │ (文件存储) │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│         │                      │                             │
│         │                      ├─> PostgreSQL (元数据)      │
│         │                      ├─> pgvector (向量搜索)      │
│         │                      └─> Auth (用户认证)          │
│         │                                                     │
│  ┌──────────────┐                                           │
│  │ 批量上传工具  │ ───────────────────────────────────────> │
│  │ (Node.js)    │                                           │
│  └──────────────┘                                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

1. **初始化阶段**：批量上传工具 → Supabase Storage + Database
2. **日常使用**：用户 → 前端 UI → Supabase → 返回结果
3. **持续维护**：内容管理员 → 前端 UI → 上传新文档

---

## 用户角色定义

### 角色权限矩阵

| 功能 | 系统管理员 | 内容管理员 | 普通用户 |
|------|-----------|-----------|---------|
| 查看文档 | ✅ | ✅ | ✅ |
| 搜索文档 | ✅ | ✅ | ✅ |
| 下载文档 | ✅ | ✅ | ✅ |
| 上传文档 | ✅ | ✅ | ❌ |
| 更新文档 | ✅ | ✅（仅自己的） | ❌ |
| 删除文档 | ✅ | ✅（仅自己的） | ❌ |
| 批量上传 | ✅ | ❌ | ❌ |
| 管理用户 | ✅ | ❌ | ❌ |
| 系统配置 | ✅ | ❌ | ❌ |

### 角色分配建议

- **系统管理员**：1-2 人（你自己 + 备份管理员）
- **内容管理员**：3-5 人（负责持续更新 FDA 报告）
- **普通用户**：10-100 人（使用知识库的团队成员）

---

## 部署流程

### 阶段 1：开发环境验证（第 1 周）

**目标**：验证基础功能

#### 步骤 1.1：测试前端上传

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000/documents
# 测试上传 5-10 份文档
```

#### 步骤 1.2：验证数据存储

1. 访问 Supabase Dashboard
2. 检查 Storage → documents bucket
3. 检查 Table Editor → documents 表
4. 确认文件和记录都已创建

#### 步骤 1.3：测试文档列表

1. 刷新 Documents 页面
2. 确认上传的文档显示在列表中
3. 测试删除功能

**完成标准**：
- ✅ 可以成功上传文档
- ✅ 文档显示在列表中
- ✅ 可以删除文档
- ✅ 无控制台错误

---

### 阶段 2：批量数据导入（第 2-3 周）

**目标**：将 10,000+ 份 FDA 文档导入系统

#### 步骤 2.1：准备文档

```bash
# 创建文档目录
mkdir fda-documents

# 将 FDA 文档放入目录（支持子目录）
# 建议按年份或类别组织：
# fda-documents/
# ├── 2024/
# ├── 2023/
# └── guidance/
```

#### 步骤 2.2：测试批量上传

```bash
# 先用少量文档测试（10-20 份）
mkdir test-documents
# 复制 10-20 份文档到 test-documents

# 运行测试上传
npm run bulk-upload:test
```

#### 步骤 2.3：大规模上传

```bash
# 确认测试成功后，开始大规模上传
SOURCE_DIR=./fda-documents CONCURRENCY=15 npm run bulk-upload

# 预计时间：
# - 1,000 份文档：约 30 分钟
# - 10,000 份文档：约 3-5 小时
# - 取决于文件大小和网络速度
```

#### 步骤 2.4：验证数据完整性

```sql
-- 在 Supabase SQL Editor 中运行

-- 检查文档总数
SELECT COUNT(*) FROM documents;

-- 检查文本提取成功率
SELECT 
  COUNT(*) as total,
  COUNT(content_text) as with_text,
  ROUND(COUNT(content_text)::numeric / COUNT(*) * 100, 2) as success_rate
FROM documents;

-- 检查文件类型分布
SELECT file_type, COUNT(*) 
FROM documents 
GROUP BY file_type 
ORDER BY COUNT(*) DESC;

-- 检查分类分布
SELECT category, COUNT(*) 
FROM documents 
GROUP BY category 
ORDER BY COUNT(*) DESC;
```

**完成标准**：
- ✅ 所有文档成功上传
- ✅ 文本提取成功率 > 95%
- ✅ 数据库记录完整
- ✅ 无重复文档

---

### 阶段 3：搜索功能开发（第 4 周）

**目标**：实现全文搜索功能

#### 步骤 3.1：创建搜索 API

```bash
# 创建 API 路由
mkdir -p src/app/api/search
touch src/app/api/search/route.ts
```

#### 步骤 3.2：实现搜索 UI

```bash
# 创建搜索组件
touch src/components/SearchBar.tsx
```

#### 步骤 3.3：测试搜索

1. 搜索关键词："FDA approval"
2. 验证结果相关性
3. 测试搜索性能

**完成标准**：
- ✅ 搜索响应时间 < 1 秒
- ✅ 搜索结果相关性高
- ✅ 支持分页

---

### 阶段 4：用户认证和权限（第 5-6 周）

**目标**：实现安全的用户认证和权限管理

#### 步骤 4.1：配置 RLS 策略

```bash
# 在 Supabase Dashboard 的 SQL Editor 中运行
# 执行 scripts/setup-auth-rls.sql
```

#### 步骤 4.2：启用 Supabase Auth

1. 访问 Supabase Dashboard → Authentication
2. 启用 Email/Password 认证
3. 配置邮件模板（可选）

#### 步骤 4.3：创建用户账号

```sql
-- 方式 1：通过 Supabase Dashboard
-- Authentication → Users → Add User

-- 方式 2：通过 SQL
-- 注意：密码需要通过 Supabase Auth API 创建
```

#### 步骤 4.4：分配用户角色

```sql
-- 为用户分配管理员角色
INSERT INTO public.user_roles (user_id, role)
VALUES ('your-user-uuid', 'admin');

-- 为用户分配内容管理员角色
INSERT INTO public.user_roles (user_id, role)
VALUES ('another-user-uuid', 'content_manager');

-- 为用户分配普通用户角色
INSERT INTO public.user_roles (user_id, role)
VALUES ('third-user-uuid', 'user');
```

#### 步骤 4.5：实现前端认证

```bash
# 创建登录页面
mkdir -p src/app/login
touch src/app/login/page.tsx

# 创建认证上下文
touch src/contexts/AuthContext.tsx
```

#### 步骤 4.6：测试权限隔离

1. 以管理员身份登录 → 测试所有功能
2. 以内容管理员身份登录 → 测试上传和删除
3. 以普通用户身份登录 → 确认只能查看

**完成标准**：
- ✅ 用户可以登录和登出
- ✅ 权限隔离正常工作
- ✅ 未认证用户无法访问

---

### 阶段 5：生产环境部署（第 7 周）

**目标**：部署到 Vercel 生产环境

#### 步骤 5.1：配置 Vercel 环境变量

1. 访问 https://vercel.com/dashboard
2. 连接 GitHub 仓库
3. 添加环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. 选择所有环境（Production, Preview, Development）

#### 步骤 5.2：触发部署

```bash
# 方式 1：通过 Git 推送
git add .
git commit -m "feat: production ready"
git push origin main

# 方式 2：通过 Vercel CLI
vercel --prod
```

#### 步骤 5.3：验证生产环境

1. 访问 Vercel 提供的生产 URL
2. 测试所有核心功能
3. 检查性能和错误日志

#### 步骤 5.4：配置自定义域名（可选）

1. 在 Vercel Dashboard 中添加域名
2. 配置 DNS 记录
3. 启用 HTTPS

**完成标准**：
- ✅ 生产环境部署成功
- ✅ 所有功能正常工作
- ✅ 性能符合预期
- ✅ 无安全漏洞

---

## 常见问题

### Q1：批量上传失败怎么办？

**A**：检查以下几点：
1. 网络连接是否稳定
2. Supabase Storage 空间是否充足
3. 环境变量是否正确配置
4. 查看错误日志，定位具体问题

### Q2：如何处理上传中断？

**A**：直接重新运行批量上传脚本，它会自动跳过已上传的文件。

### Q3：如何升级 Supabase 计划？

**A**：
1. 访问 Supabase Dashboard → Settings → Billing
2. 选择 Pro 计划（$25/月）
3. 获得 100GB Storage 和 8GB Database

### Q4：如何备份数据？

**A**：
1. 数据库备份：Supabase 自动每日备份
2. Storage 备份：使用 Supabase CLI 或 API 下载所有文件
3. 建议定期导出数据库到本地

### Q5：如何监控系统性能？

**A**：
1. Vercel Analytics：监控前端性能
2. Supabase Dashboard：监控数据库和 API 性能
3. 设置告警：在 Supabase 中配置使用量告警

---

## 下一步

完成部署后，你可以：

1. ✅ 开发向量搜索功能
2. ✅ 实现 RAG 问答系统
3. ✅ 添加文档分类和标签管理
4. ✅ 实现高级搜索过滤
5. ✅ 添加用户活动日志
6. ✅ 实现文档版本控制

---

**祝你部署顺利！** 🎉

如有问题，请参考：
- [Supabase 文档](https://supabase.com/docs)
- [Vercel 文档](https://vercel.com/docs)
- [Next.js 文档](https://nextjs.org/docs)

