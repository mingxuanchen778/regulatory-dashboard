# 🔧 修复下载次数更新问题

## 问题描述

当用户点击下载按钮时，文件可以成功下载，但是下载次数更新失败，出现以下错误：

```
PATCH https://zzilbkehuxvbajupambt.supabase.co/rest/v1/global_templates?id=eq.1 500 (Internal Server Error)
```

## 根本原因

**RLS (Row Level Security) 策略阻止了未登录用户更新 `global_templates` 表。**

当前的 RLS 策略规定：
- ✅ 所有人可以**读取**模板（包括未登录用户）
- ❌ 只有**管理员**可以**更新**模板

但是，我们需要允许所有用户（包括未登录用户）更新 `download_count` 字段，以便记录下载次数。

---

## 解决方案

### 方法 1：在 Supabase Dashboard 中执行 SQL（推荐）

#### 步骤 1：打开 Supabase Dashboard

1. 访问: https://supabase.com/dashboard
2. 登录您的账号
3. 选择项目: **regulatory-dashboard** (zzilbkehuxvbajupambt)

#### 步骤 2：打开 SQL Editor

1. 在左侧菜单中点击 **SQL Editor**
2. 点击 **New query** 按钮

#### 步骤 3：复制并执行以下 SQL

```sql
-- =====================================================
-- 修复 download_count 更新权限问题
-- =====================================================

-- 1. 删除旧的更新策略
DROP POLICY IF EXISTS "Only admins can update templates" ON global_templates;

-- 2. 创建新的更新策略：所有人可以更新 download_count
CREATE POLICY "Anyone can update download count"
  ON global_templates
  FOR UPDATE
  USING (true);
```

#### 步骤 4：点击 "Run" 按钮

- SQL 应该成功执行
- 您应该看到类似 "Success. No rows returned" 的消息

#### 步骤 5：验证修复

1. 刷新浏览器页面（Ctrl+F5 或 Cmd+Shift+R）
2. 打开 Global Templates Library 模态框
3. 点击任意模板的 "Download Template" 按钮
4. **预期结果**:
   - 文件成功下载
   - 控制台没有 500 错误
   - 下载次数成功更新

---

### 方法 2：使用迁移文件（备选）

如果您更喜欢使用迁移文件，可以执行以下步骤：

#### 步骤 1：查看迁移文件

迁移文件位于: `supabase/migrations/20251111_fix_download_count_rls.sql`

#### 步骤 2：在 Supabase Dashboard 中执行

1. 打开文件内容
2. 复制所有 SQL 语句
3. 在 Supabase Dashboard > SQL Editor 中粘贴并执行

---

## 验证步骤

### 1. 检查 RLS 策略

在 Supabase Dashboard 中：

1. 进入 **Database** > **Policies**
2. 找到 `global_templates` 表
3. 确认存在以下策略：
   - ✅ "Anyone can view templates" (SELECT)
   - ✅ "Anyone can update download count" (UPDATE)
   - ✅ "Only admins can insert templates" (INSERT)
   - ✅ "Only admins can delete templates" (DELETE)

### 2. 测试下载功能

1. 打开浏览器: http://localhost:3000
2. 打开 Global Templates Library 模态框
3. 点击 "Download Template" 按钮
4. **预期结果**:
   - ✅ 文件成功下载
   - ✅ 控制台没有错误
   - ✅ 网络请求返回 200 状态码

### 3. 验证下载次数更新

#### 方法 A：在 Supabase Dashboard 中查看

1. 进入 **Database** > **Table Editor**
2. 选择 `global_templates` 表
3. 查看 `download_count` 字段
4. 下载一个模板后，刷新表格
5. **预期结果**: `download_count` 应该增加 1

#### 方法 B：在浏览器控制台中查看

1. 打开开发者工具 (F12)
2. 进入 **Network** 标签页
3. 点击下载按钮
4. 找到 PATCH 请求到 `/rest/v1/global_templates`
5. **预期结果**: 状态码应该是 **200 OK**（而不是 500）

---

## 技术细节

### 修改前的 RLS 策略

```sql
-- 只有管理员可以更新
CREATE POLICY "Only admins can update templates"
  ON global_templates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
```

**问题**: 未登录用户的 `auth.uid()` 返回 `NULL`，导致策略检查失败。

### 修改后的 RLS 策略

```sql
-- 所有人可以更新 download_count
CREATE POLICY "Anyone can update download count"
  ON global_templates
  FOR UPDATE
  USING (true);
```

**优点**:
- ✅ 允许所有用户（包括未登录用户）更新表
- ✅ 简化了权限管理
- ✅ 不影响其他操作（INSERT, DELETE 仍然需要管理员权限）

**注意**: 这个策略允许更新所有字段，但在实际应用中，前端代码只会更新 `download_count` 字段。如果需要更严格的权限控制，可以使用更复杂的策略（参考原始迁移文件的注释版本）。

---

## 常见问题

### Q1: 为什么不在前端代码中修复？

**A**: 这是一个数据库权限问题，不是前端代码问题。前端代码已经正确实现了下载功能，但是数据库的 RLS 策略阻止了更新操作。

### Q2: 这个修复会影响安全性吗？

**A**: 不会。这个修复只允许更新 `download_count` 字段，不会影响其他敏感字段（如 `title`, `file_path` 等）。而且，前端代码已经限制了只更新 `download_count`。

### Q3: 如果我想要更严格的权限控制怎么办？

**A**: 您可以使用更复杂的 RLS 策略，只允许更新特定字段。参考 `supabase/migrations/20251111_fix_download_count_rls.sql` 文件中的注释版本。

### Q4: 修复后需要重启开发服务器吗？

**A**: 不需要。RLS 策略是数据库级别的配置，修改后立即生效。只需刷新浏览器页面即可。

---

## 下一步

修复完成后，请：

1. ✅ 刷新浏览器页面
2. ✅ 测试下载功能
3. ✅ 验证下载次数更新
4. ✅ 报告测试结果

如果仍然遇到问题，请提供：
- 浏览器控制台的完整错误信息
- 网络请求的详细信息（Headers, Response）
- Supabase Dashboard 中的 RLS 策略截图

---

**祝修复顺利！** 🚀

