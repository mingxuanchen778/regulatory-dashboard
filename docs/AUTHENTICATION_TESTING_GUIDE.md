# 认证系统完整测试指南

本文档提供了完整的认证系统测试方案，涵盖阶段 1-4 实现的所有功能。

---

## 📋 测试前准备

### 1. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

### 2. 配置 Supabase Dashboard

在开始测试之前，请确保已完成以下配置：

#### **必需配置（P0）：**

1. **URL Configuration**
   - 进入 **Authentication** → **URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs:
     ```
     http://localhost:3000/auth/confirm
     http://localhost:3000/auth/callback
     http://localhost:3000/reset-password
     ```

2. **Email Templates**
   - 配置 "Confirm signup" 邮件模板（见主文档）
   - 配置 "Reset Password" 邮件模板（见主文档）

3. **Email Confirmation（可选）**
   - 进入 **Authentication** → **Providers** → **Email**
   - 勾选或取消勾选 **Enable email confirmations**
   - 建议：测试时先**不启用**，测试基础功能后再启用测试邮箱验证

#### **查看邮件内容（开发环境）：**

如果没有配置 SMTP，Supabase 不会真正发送邮件，但您可以通过以下方式查看邮件内容：

**方法 1：Supabase Dashboard**
- 进入 **Authentication** → **Users**
- 点击用户的 **...** 菜单
- 选择 **Send magic link** 或 **Send password recovery**
- 邮件内容会显示在浏览器控制台

**方法 2：浏览器控制台**
- 打开浏览器开发者工具（F12）
- 切换到 **Console** 标签
- 注册或重置密码时，Supabase 会在控制台输出邮件链接

**方法 3：Supabase Logs**
- 进入 Supabase Dashboard → **Logs** → **Auth Logs**
- 查看最近的认证事件和邮件发送记录

### 3. 准备测试数据

创建以下测试账户：

```javascript
// 测试账户 1（用于基础登录测试）
const testUser1 = {
  fullName: "张三",
  email: "zhangsan@example.com",
  password: "password123"
};

// 测试账户 2（用于邮箱验证测试）
const testUser2 = {
  fullName: "李四",
  email: "lisi@example.com",
  password: "password456"
};

// 测试账户 3（用于密码重置测试）
const testUser3 = {
  fullName: "王五",
  email: "wangwu@example.com",
  password: "password789"
};
```

---

## 🧪 测试用例

### 优先级说明
- **P0**：核心功能，必须通过
- **P1**：重要功能，应该通过
- **P2**：边界情况，建议通过

---

## P0 核心功能测试

### 测试 1：Email/Password 注册（未启用邮箱验证）

**测试目标：** 验证用户可以通过邮箱密码成功注册

**前置条件：**
- Supabase 未启用邮箱验证（**Enable email confirmations** 未勾选）
- 测试邮箱未被注册

**测试步骤：**
1. 访问 `http://localhost:3000/signup`
2. 填写表单：
   - Full Name: "张三"
   - Email: "zhangsan@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
3. 点击 "注册" 按钮

**预期结果：**
- ✅ 按钮显示 "注册中..." + 旋转图标
- ✅ 注册成功后自动重定向到首页（`/`）
- ✅ 首页显示 "Welcome back, 张三"
- ✅ Sidebar 显示 "张三" 和 "zhangsan@example.com"
- ✅ Supabase Dashboard → **Users** 中出现新用户
- ✅ `profiles` 表中有对应记录（full_name = "张三"）

**验证方法：**
```sql
-- 在 Supabase SQL Editor 中执行
SELECT * FROM auth.users WHERE email = 'zhangsan@example.com';
SELECT * FROM public.profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'zhangsan@example.com');
```

---

### 测试 2：Email/Password 登录

**测试目标：** 验证用户可以使用邮箱密码登录

**前置条件：**
- 已有注册用户（使用测试 1 创建的账户）
- 用户已登出

**测试步骤：**
1. 访问 `http://localhost:3000/login`
2. 填写表单：
   - Email: "zhangsan@example.com"
   - Password: "password123"
3. 点击 "登录" 按钮

**预期结果：**
- ✅ 按钮显示 "登录中..." + 旋转图标
- ✅ 登录成功后自动重定向到首页（`/`）
- ✅ 首页显示 "Welcome back, 张三"
- ✅ Sidebar 显示用户信息

---

### 测试 3：登出功能

**测试目标：** 验证用户可以成功登出

**前置条件：**
- 用户已登录

**测试步骤：**
1. 在任意页面，点击 Sidebar 底部的 "Sign Out" 按钮

**预期结果：**
- ✅ 自动重定向到登录页（`/login`）
- ✅ 无法访问受保护的页面（如 `/`）
- ✅ 访问 `/` 时自动重定向到 `/login`

---

### 测试 4：路由保护 - 未登录访问受保护页面

**测试目标：** 验证 middleware 正确保护路由

**前置条件：**
- 用户未登录

**测试步骤：**
1. 在浏览器中直接访问 `http://localhost:3000/`

**预期结果：**
- ✅ 自动重定向到 `/login`
- ✅ URL 变为 `http://localhost:3000/login`

---

### 测试 5：路由保护 - 已登录访问登录页

**测试目标：** 验证已登录用户无法访问登录/注册页面

**前置条件：**
- 用户已登录

**测试步骤：**
1. 在浏览器中直接访问 `http://localhost:3000/login`
2. 在浏览器中直接访问 `http://localhost:3000/signup`

**预期结果：**
- ✅ 两次访问都自动重定向到首页（`/`）
- ✅ URL 变为 `http://localhost:3000/`

---

## P0 邮箱验证流程测试（阶段 4 新增）

### 测试 6：Email/Password 注册（启用邮箱验证）

**测试目标：** 验证启用邮箱验证后的注册流程

**前置条件：**
- Supabase 已启用邮箱验证（**Enable email confirmations** 已勾选）
- 测试邮箱未被注册

**测试步骤：**
1. 访问 `http://localhost:3000/signup`
2. 填写表单：
   - Full Name: "李四"
   - Email: "lisi@example.com"
   - Password: "password456"
   - Confirm Password: "password456"
3. 点击 "注册" 按钮

**预期结果：**
- ✅ 按钮显示 "注册中..." + 旋转图标
- ✅ 注册成功后**不**自动重定向
- ✅ 页面显示红色提示框："注册成功！请检查您的邮箱以完成验证。"
- ✅ Supabase Dashboard → **Users** 中出现新用户
- ✅ 用户的 **Email Confirmed** 状态为 `false`

**验证方法：**
```sql
-- 在 Supabase SQL Editor 中执行
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'lisi@example.com';
-- email_confirmed_at 应该为 NULL
```

---

### 测试 7：邮箱验证链接点击

**测试目标：** 验证用户点击邮件中的验证链接后成功验证

**前置条件：**
- 已完成测试 6（用户已注册但未验证）
- 已获取验证邮件链接

**获取验证链接的方法：**

**方法 1：Supabase Dashboard**
1. 进入 **Authentication** → **Users**
2. 找到 `lisi@example.com` 用户
3. 点击 **...** 菜单 → **Send magic link**
4. 在浏览器控制台查看链接

**方法 2：手动构造链接**
1. 在 Supabase Dashboard → **Authentication** → **Users** 中找到用户
2. 复制用户的 `confirmation_token`（如果可见）
3. 构造链接：
   ```
   http://localhost:3000/auth/confirm?token_hash=<token>&type=email
   ```

**方法 3：查看 Supabase Logs**
1. 进入 **Logs** → **Auth Logs**
2. 查找 `signup` 事件
3. 复制邮件链接

**测试步骤：**
1. 复制验证链接（格式：`http://localhost:3000/auth/confirm?token_hash=xxx&type=email`）
2. 在浏览器中打开链接

**预期结果：**
- ✅ 显示 "正在验证..." 加载动画
- ✅ 显示绿色勾选图标和 "验证成功" 提示
- ✅ 提示文字："您的邮箱已成功验证！"
- ✅ 2 秒后自动重定向到首页（`/`）
- ✅ 首页显示 "Welcome back, 李四"
- ✅ Sidebar 显示用户信息
- ✅ Supabase Dashboard 中用户的 **Email Confirmed** 状态变为 `true`

**验证方法：**
```sql
-- 在 Supabase SQL Editor 中执行
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'lisi@example.com';
-- email_confirmed_at 应该有时间戳
```

---

## P0 密码重置流程测试（阶段 4 新增）

### 测试 8：访问忘记密码页面

**测试目标：** 验证用户可以从登录页面访问忘记密码页面

**前置条件：**
- 无

**测试步骤：**
1. 访问 `http://localhost:3000/login`
2. 点击密码输入框下方的 "忘记密码？" 链接

**预期结果：**
- ✅ 跳转到 `/forgot-password` 页面
- ✅ 页面显示 "重置密码" 标题
- ✅ 显示邮箱输入框和 "发送重置邮件" 按钮

---

### 测试 9：发送密码重置邮件

**测试目标：** 验证用户可以请求密码重置邮件

**前置条件：**
- 已有注册用户（使用测试 1 或测试 6 创建的账户）

**测试步骤：**
1. 访问 `http://localhost:3000/forgot-password`
2. 输入邮箱：`zhangsan@example.com`
3. 点击 "发送重置邮件" 按钮

**预期结果：**
- ✅ 按钮显示 "发送中..." + 旋转图标
- ✅ 成功后显示绿色勾选图标
- ✅ 显示 "邮件已发送" 标题
- ✅ 显示发送的邮箱地址：`zhangsan@example.com`
- ✅ 显示提示："请检查您的邮箱（包括垃圾邮件文件夹）"
- ✅ 显示 "返回登录页" 和 "重新发送" 按钮

**获取重置链接的方法：**

与测试 7 类似，使用以下方法之一：
- Supabase Dashboard → **Users** → **Send password recovery**
- 查看 Supabase Logs → **Auth Logs**
- 浏览器控制台

重置链接格式：
```
http://localhost:3000/auth/confirm?token_hash=xxx&type=recovery
```

---

### 测试 10：点击密码重置链接

**测试目标：** 验证用户点击重置链接后进入密码重置页面

**前置条件：**
- 已完成测试 9（已发送重置邮件）
- 已获取重置链接

**测试步骤：**
1. 复制重置链接（格式：`http://localhost:3000/auth/confirm?token_hash=xxx&type=recovery`）
2. 在浏览器中打开链接

**预期结果：**
- ✅ 显示 "正在验证..." 加载动画
- ✅ 显示 "验证成功" 提示
- ✅ 提示文字："正在跳转到密码重置页面"
- ✅ 2 秒后自动重定向到 `/reset-password` 页面
- ✅ 密码重置页面显示 "设置新密码" 标题
- ✅ 显示两个密码输入框（新密码、确认新密码）

---

### 测试 11：设置新密码

**测试目标：** 验证用户可以成功设置新密码

**前置条件：**
- 已完成测试 10（已进入密码重置页面）

**测试步骤：**
1. 在密码重置页面填写：
   - 新密码：`newpassword123`
   - 确认新密码：`newpassword123`
2. 点击 "重置密码" 按钮

**预期结果：**
- ✅ 按钮显示 "更新中..." + 旋转图标
- ✅ 成功后显示绿色勾选图标
- ✅ 显示 "密码已成功重置！" 提示
- ✅ 显示 "正在跳转到登录页，请使用新密码登录..." 提示
- ✅ 3 秒后自动重定向到 `/login` 页面

---

### 测试 12：使用新密码登录

**测试目标：** 验证新密码生效

**前置条件：**
- 已完成测试 11（已重置密码）

**测试步骤：**
1. 在登录页面填写：
   - Email: `zhangsan@example.com`
   - Password: `newpassword123`（新密码）
2. 点击 "登录" 按钮

**预期结果：**
- ✅ 登录成功，重定向到首页
- ✅ 首页显示 "Welcome back, 张三"

**验证旧密码失效：**
1. 登出
2. 尝试使用旧密码登录：`password123`
3. ✅ 应该显示错误："邮箱或密码错误"

---

## P1 重要功能测试

### 测试 13：Microsoft OAuth 登录

**测试目标：** 验证 Microsoft OAuth 登录流程

**前置条件：**
- Supabase 已配置 Microsoft OAuth（Azure AD）
- 用户未登录

**测试步骤：**
1. 访问 `http://localhost:3000/login`
2. 点击 "使用 Microsoft 登录" 按钮

**预期结果：**
- ✅ 跳转到 Microsoft 登录页面
- ✅ 输入 Microsoft 账户凭据后授权
- ✅ 重定向回 `/auth/callback`
- ✅ 最终重定向到首页（`/`）
- ✅ 首页显示 Microsoft 账户的用户名
- ✅ Sidebar 显示 Microsoft 账户信息

**注意：** 如果未配置 Microsoft OAuth，此测试会失败。

---

### 测试 14：Google OAuth 登录

**测试目标：** 验证 Google OAuth 登录流程

**前置条件：**
- Supabase 已配置 Google OAuth
- 用户未登录

**测试步骤：**
1. 访问 `http://localhost:3000/login`
2. 点击 "使用 Google 登录" 按钮

**预期结果：**
- ✅ 跳转到 Google 登录页面
- ✅ 选择 Google 账户后授权
- ✅ 重定向回 `/auth/callback`
- ✅ 最终重定向到首页（`/`）
- ✅ 首页显示 Google 账户的用户名
- ✅ Sidebar 显示 Google 账户信息

**注意：** 如果未配置 Google OAuth，此测试会失败。

---

### 测试 15：用户头像显示

**测试目标：** 验证用户头像或首字母占位符正确显示

**前置条件：**
- 用户已登录

**测试步骤：**
1. 登录后查看 Sidebar

**预期结果：**

**情况 1：用户有头像（OAuth 登录）**
- ✅ Sidebar 显示圆形头像图片
- ✅ 图片使用 `object-cover` 正确裁剪

**情况 2：用户无头像（Email/Password 登录）**
- ✅ Sidebar 显示首字母占位符
- ✅ 占位符背景为渐变蓝紫色
- ✅ 显示用户名的首字母（如 "张三" 显示 "张"）
- ✅ 首字母为白色，居中显示

---

## P2 边界情况和错误处理测试

### 测试 16：错误的邮箱或密码

**测试目标：** 验证登录时的错误处理

**前置条件：**
- 用户未登录

**测试步骤：**
1. 访问 `http://localhost:3000/login`
2. 输入错误的凭据：
   - Email: `zhangsan@example.com`
   - Password: `wrongpassword`
3. 点击 "登录" 按钮

**预期结果：**
- ✅ 显示红色错误提示框
- ✅ 错误消息："邮箱或密码错误"
- ✅ 不重定向，停留在登录页面

---

### 测试 17：已存在的邮箱注册

**测试目标：** 验证注册时的重复邮箱检测

**前置条件：**
- 邮箱 `zhangsan@example.com` 已被注册

**测试步骤：**
1. 访问 `http://localhost:3000/signup`
2. 尝试使用已存在的邮箱注册：
   - Full Name: "测试用户"
   - Email: `zhangsan@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. 点击 "注册" 按钮

**预期结果：**
- ✅ 显示红色错误提示框
- ✅ 错误消息包含 "already registered" 或类似提示
- ✅ 不创建新用户

---

### 测试 18：密码不匹配

**测试目标：** 验证注册和密码重置时的密码匹配验证

**测试场景 1：注册时密码不匹配**
1. 访问 `/signup`
2. 填写表单，但两次密码不一致：
   - Password: `password123`
   - Confirm Password: `password456`
3. 点击 "注册" 按钮
4. ✅ 显示错误："两次输入的密码不一致"

**测试场景 2：密码重置时密码不匹配**
1. 访问 `/reset-password`（通过重置链接）
2. 填写表单，但两次密码不一致：
   - 新密码: `newpassword123`
   - 确认新密码: `newpassword456`
3. 点击 "重置密码" 按钮
4. ✅ 显示错误："两次输入的密码不一致"

---

### 测试 19：密码太短

**测试目标：** 验证密码长度验证

**测试场景 1：注册时密码太短**
1. 访问 `/signup`
2. 输入短密码：`12345`（少于 6 位）
3. 点击 "注册" 按钮
4. ✅ 显示错误："密码至少需要 6 位字符"

**测试场景 2：密码重置时密码太短**
1. 访问 `/reset-password`（通过重置链接）
2. 输入短密码：`12345`
3. 点击 "重置密码" 按钮
4. ✅ 显示错误："密码至少需要 6 位字符"

---

### 测试 20：过期的验证/重置链接

**测试目标：** 验证过期链接的错误处理

**前置条件：**
- 有一个过期的验证或重置链接（通常 24 小时后过期）

**测试步骤：**
1. 使用过期的链接访问 `/auth/confirm`

**预期结果：**
- ✅ 显示红色 X 图标
- ✅ 错误消息："验证链接已过期，请重新发送验证邮件"
- ✅ 显示 "返回登录页" 和 "重新注册" 按钮

**模拟过期链接：**
```
http://localhost:3000/auth/confirm?token_hash=expired_token&type=email
```

---

### 测试 21：无效的验证/重置链接

**测试目标：** 验证无效链接的错误处理

**测试步骤：**
1. 使用无效的 token_hash 访问：
   ```
   http://localhost:3000/auth/confirm?token_hash=invalid_token&type=email
   ```

**预期结果：**
- ✅ 显示红色 X 图标
- ✅ 错误消息："验证链接无效，请检查邮件中的链接"
- ✅ 显示 "返回登录页" 和 "重新注册" 按钮

---

### 测试 22：未授权访问密码重置页面

**测试目标：** 验证直接访问密码重置页面的安全性

**前置条件：**
- 用户未通过重置链接访问（没有有效会话）

**测试步骤：**
1. 直接在浏览器中访问：
   ```
   http://localhost:3000/reset-password
   ```

**预期结果：**
- ✅ 显示 "无效的访问" 提示
- ✅ 提示文字："请通过邮件中的重置链接访问此页面"
- ✅ 显示 "正在重定向到登录页..." 提示
- ✅ 2 秒后自动重定向到 `/login`

---

## 🔍 测试失败常见问题排查

### 问题 1：注册后没有自动登录

**可能原因：**
- Supabase 启用了邮箱验证

**解决方法：**
- 检查 Supabase Dashboard → **Authentication** → **Providers** → **Email**
- 确认 **Enable email confirmations** 的状态
- 如果启用，用户需要先验证邮箱才能登录

---

### 问题 2：无法获取验证/重置邮件链接

**可能原因：**
- 没有配置 SMTP
- 邮件模板配置错误

**解决方法：**

**方法 1：使用 Supabase Dashboard**
1. 进入 **Authentication** → **Users**
2. 找到用户，点击 **...** 菜单
3. 选择 **Send magic link** 或 **Send password recovery**
4. 在浏览器控制台查看链接

**方法 2：查看 Supabase Logs**
1. 进入 **Logs** → **Auth Logs**
2. 查找最近的 `signup` 或 `recovery` 事件
3. 复制邮件链接

**方法 3：手动构造链接**
```
# 邮箱验证
http://localhost:3000/auth/confirm?token_hash=<token>&type=email

# 密码重置
http://localhost:3000/auth/confirm?token_hash=<token>&type=recovery
```

---

### 问题 3：OAuth 登录失败

**可能原因：**
- 未配置 OAuth 提供商
- Redirect URL 配置错误

**解决方法：**
1. 检查 Supabase Dashboard → **Authentication** → **Providers**
2. 确认 Microsoft/Google OAuth 已启用
3. 检查 Redirect URLs 配置：
   ```
   http://localhost:3000/auth/callback
   ```
4. 检查 OAuth 提供商的配置（Client ID、Client Secret）

---

### 问题 4：Middleware 重定向循环

**可能原因：**
- Middleware 配置错误
- Session 获取失败

**解决方法：**
1. 检查 `src/middleware.ts` 文件
2. 确认 `matcher` 配置正确
3. 检查浏览器控制台是否有错误
4. 清除浏览器缓存和 Cookies

---

### 问题 5：用户信息不显示

**可能原因：**
- AuthContext 未正确初始化
- `profiles` 表数据缺失

**解决方法：**
1. 检查浏览器控制台是否有错误
2. 验证 `profiles` 表中有用户记录：
   ```sql
   SELECT * FROM public.profiles WHERE id = '<user_id>';
   ```
3. 检查 `full_name` 字段是否有值
4. 刷新页面，确保 AuthContext 重新加载

---

## 📊 测试结果记录模板

使用以下模板记录测试结果：

```markdown
## 测试执行记录

**测试日期：** 2025-01-XX
**测试人员：** XXX
**环境：** 开发环境（localhost:3000）

### P0 核心功能测试

| 测试编号 | 测试名称 | 状态 | 备注 |
|---------|---------|------|------|
| 测试 1 | Email/Password 注册（未启用邮箱验证） | ✅ 通过 | - |
| 测试 2 | Email/Password 登录 | ✅ 通过 | - |
| 测试 3 | 登出功能 | ✅ 通过 | - |
| 测试 4 | 路由保护 - 未登录访问受保护页面 | ✅ 通过 | - |
| 测试 5 | 路由保护 - 已登录访问登录页 | ✅ 通过 | - |
| 测试 6 | Email/Password 注册（启用邮箱验证） | ✅ 通过 | - |
| 测试 7 | 邮箱验证链接点击 | ✅ 通过 | - |
| 测试 8 | 访问忘记密码页面 | ✅ 通过 | - |
| 测试 9 | 发送密码重置邮件 | ✅ 通过 | - |
| 测试 10 | 点击密码重置链接 | ✅ 通过 | - |
| 测试 11 | 设置新密码 | ✅ 通过 | - |
| 测试 12 | 使用新密码登录 | ✅ 通过 | - |

### P1 重要功能测试

| 测试编号 | 测试名称 | 状态 | 备注 |
|---------|---------|------|------|
| 测试 13 | Microsoft OAuth 登录 | ⏭️ 跳过 | 未配置 OAuth |
| 测试 14 | Google OAuth 登录 | ⏭️ 跳过 | 未配置 OAuth |
| 测试 15 | 用户头像显示 | ✅ 通过 | - |

### P2 边界情况测试

| 测试编号 | 测试名称 | 状态 | 备注 |
|---------|---------|------|------|
| 测试 16 | 错误的邮箱或密码 | ✅ 通过 | - |
| 测试 17 | 已存在的邮箱注册 | ✅ 通过 | - |
| 测试 18 | 密码不匹配 | ✅ 通过 | - |
| 测试 19 | 密码太短 | ✅ 通过 | - |
| 测试 20 | 过期的验证/重置链接 | ✅ 通过 | - |
| 测试 21 | 无效的验证/重置链接 | ✅ 通过 | - |
| 测试 22 | 未授权访问密码重置页面 | ✅ 通过 | - |

### 总结

- **通过率：** XX/22 (XX%)
- **关键问题：** 无
- **建议：** 无
```

---

## 🎯 下一步

完成所有测试后，您可以：

1. **部署到生产环境**
   - 更新 Supabase URL Configuration（使用生产域名）
   - 配置生产环境的 SMTP（真实发送邮件）
   - 更新邮件模板中的链接

2. **添加更多功能**
   - 用户角色管理
   - 权限控制
   - 多因素认证（MFA）
   - 社交账户绑定

3. **性能优化**
   - 添加缓存
   - 优化数据库查询
   - 实现 CDN

---

**文档版本：** 1.0  
**最后更新：** 2025-01-08  
**维护者：** Augment Agent

