# 🔧 Vercel 部署错误修复指南

## 🔴 错误信息

```
Environment Variable
"NEXT_PUBLIC_SUPABASE_URL" references Secret
"supabase_url", which does not exist.
```

---

## 🎯 问题根源

### 问题 1：`vercel.json` 配置错误

**错误的配置**（已修复）：
```json
{
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key"
  }
}
```

**问题说明**：
- `@supabase_url` 语法是引用 Vercel Secret 的方式
- 但在 Vercel Dashboard 中并没有创建这些 Secret
- 环境变量是直接在 Dashboard 中配置的，不需要通过 Secret 引用

**正确的配置**（当前）：
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

**修复说明**：
- ✅ 已删除 `env` 配置块
- ✅ 环境变量应该直接在 Vercel Dashboard 中配置
- ✅ 不需要在 `vercel.json` 中引用

---

## ✅ 完整修复步骤

### 步骤 1：验证代码已更新（已完成）

```bash
# 检查 Git 状态
git status
# 输出：On branch main, Your branch is up to date with 'origin/main'

# 查看最新提交
git log --oneline -1
# 输出：5889d1b fix: remove env references from vercel.json to avoid Secret conflicts
```

✅ **状态**：代码已成功推送到 GitHub

---

### 步骤 2：在 Vercel Dashboard 中验证环境变量

#### 2.1 访问 Vercel 项目设置

1. 访问 https://vercel.com/dashboard
2. 选择项目：`regulatory-dashboard`
3. 进入 **Settings** → **Environment Variables**

#### 2.2 验证环境变量配置

请确认以下 3 个环境变量已正确配置：

| Key | 正确的 Value | 环境 | 保密 |
|-----|-------------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zzilbkehuxvbajupambt.supabase.co` | Production, Preview, Development | ❌ 否 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6aWxia2VodXh2YmFqdXBhbWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzcwNDUsImV4cCI6MjA3Nzg1MzA0NX0.sO70nzYVIy1FZaVQKPvG1Q_AO0lTGVCyvJkHFCCoSgY` | Production, Preview, Development | ❌ 否 |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6aWxia2VodXh2YmFqdXBhbWJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI3NzA0NSwiZXhwIjoyMDc3ODUzMDQ1fQ.XewSyg7xekPJ3B7QvFtiaEHBXYj7mYR1-EJbLO1eHME` | Production, Preview, Development | ✅ **是** |

#### 2.3 检查要点

**⚠️ 重要检查项**：

1. **URL 拼写检查**：
   - ✅ 正确：`https://zzilbkehuxvbajupambt.supabase.co`
   - ❌ 错误：`https://zzilbkehujxvbajupambt.supabase.co`（注意 `hux` vs `huj`）

2. **JWT Token 完整性**：
   - ✅ 确保 token 包含 3 个部分（用点号分隔）
   - ✅ 确保没有多余的空格或换行符
   - ✅ 确保没有被截断

3. **环境选择**：
   - ✅ 所有 3 个变量都应该应用到：Production, Preview, Development

4. **保密设置**：
   - ❌ `NEXT_PUBLIC_SUPABASE_URL` - 不保密（客户端可见）
   - ❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 不保密（客户端可见）
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` - **必须保密**（仅服务端）

#### 2.4 如何修正环境变量

如果发现值不正确，请按以下步骤修正：

1. 点击变量右侧的 **"Edit"** 按钮
2. 删除错误的值
3. 从 `.env.local` 文件中复制正确的值：
   ```bash
   # 在项目根目录执行
   cat .env.local
   ```
4. 粘贴到 Vercel Dashboard 的 Value 字段
5. 确保选择所有环境（Production, Preview, Development）
6. 点击 **"Save"**

---

### 步骤 3：触发重新部署

#### 方式 1：通过 Vercel Dashboard（推荐）

1. 进入项目 → **Deployments** 标签
2. 找到最新的部署（应该是失败状态）
3. 点击右侧的 **"..."** 菜单
4. 选择 **"Redeploy"**
5. 确认重新部署

#### 方式 2：通过 Git Push（自动触发）

由于我们刚刚推送了修复代码，Vercel 应该会自动触发新的部署。

检查部署状态：
1. 访问 https://vercel.com/dashboard
2. 查看 **Deployments** 标签
3. 等待新的部署完成（通常需要 2-5 分钟）

#### 方式 3：通过 Vercel CLI

```bash
# 安装 Vercel CLI（如果还没有）
npm i -g vercel

# 登录
vercel login

# 链接项目
vercel link

# 触发生产部署
vercel --prod
```

---

### 步骤 4：验证部署成功

#### 4.1 检查部署状态

1. 访问 Vercel Dashboard → Deployments
2. 查看最新部署的状态：
   - ✅ **Ready**：部署成功
   - ⏳ **Building**：正在构建
   - 🔴 **Error**：部署失败

#### 4.2 查看部署日志

如果部署失败，点击失败的部署查看详细日志：

1. 点击失败的部署
2. 查看 **Build Logs**
3. 查找错误信息

**常见错误**：
- `Missing env.NEXT_PUBLIC_SUPABASE_URL` - 环境变量未配置
- `Failed to compile` - 代码编译错误
- `Module not found` - 依赖缺失

#### 4.3 测试生产环境

部署成功后，访问生产 URL 测试功能：

```bash
# 获取生产 URL
vercel ls

# 或者在 Vercel Dashboard 中查看
```

**测试清单**：
- [ ] 页面能够正常加载
- [ ] 没有环境变量相关的错误
- [ ] 浏览器控制台没有 Supabase 连接错误
- [ ] 文件上传功能正常（如果已实现）

---

## 🔍 故障排除

### 问题 1：部署仍然失败

**可能原因**：
1. 环境变量值不正确
2. 环境变量未应用到正确的环境
3. 代码中有其他错误

**解决方案**：
1. 重新检查 Vercel Dashboard 中的环境变量
2. 确保所有 3 个变量都已配置
3. 查看部署日志中的具体错误信息

### 问题 2：环境变量未生效

**可能原因**：
1. 修改环境变量后未重新部署
2. 环境变量未应用到当前环境

**解决方案**：
1. 修改环境变量后必须重新部署
2. 确认环境变量应用到了 Production 环境

### 问题 3：Secret 引用错误仍然存在

**可能原因**：
1. `vercel.json` 修改未推送到 GitHub
2. Vercel 使用了缓存的旧配置

**解决方案**：
```bash
# 检查本地 vercel.json
cat vercel.json

# 确认不包含 "env" 配置块

# 检查 GitHub 上的版本
# 访问：https://github.com/mingxuanchen778/regulatory-dashboard/blob/main/vercel.json

# 如果不一致，重新推送
git push origin main --force
```

---

## 📚 相关文档

- **环境变量完整指南**：`docs/ENVIRONMENT_VARIABLES.md`
- **快速参考卡片**：`docs/ENV_QUICK_REFERENCE.md`
- **部署指南**：`DEPLOYMENT_GUIDE.md`

---

## 🎉 修复完成检查清单

- [x] ✅ 修改 `vercel.json`，删除 `env` 配置块
- [x] ✅ 提交并推送代码到 GitHub
- [ ] ⏳ 在 Vercel Dashboard 中验证环境变量配置
- [ ] ⏳ 触发重新部署
- [ ] ⏳ 验证部署成功
- [ ] ⏳ 测试生产环境功能

---

**修复指南版本**：v1.0  
**最后更新**：2025-01-06  
**问题状态**：已识别并修复代码，等待用户验证 Vercel 配置

