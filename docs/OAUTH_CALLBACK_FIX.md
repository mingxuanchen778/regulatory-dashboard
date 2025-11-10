# 🔧 OAuth 回调问题修复指南

## 🔴 问题描述

**症状**：
- 用户登录/注册后，页面跳转到 `/auth/callback#`
- 显示错误："Login Verification Failed - Authorization code not found, please log in again"
- Console 显示错误："OAuth callback error: Error: Authorization code not found"

**根本原因**：
OAuth 回调 URL 配置不正确，导致授权码（authorization code）没有被正确传递到回调页面。

---

## ✅ 解决方案

### 步骤 1：配置 Supabase 重定向 URL

#### 1.1 登录 Supabase Dashboard

1. 访问：https://supabase.com/dashboard
2. 选择项目：`regulatory-dashboard` (ID: zzilbkehuxvbajupambt)

#### 1.2 配置 Authentication URLs

1. 进入：`Authentication` → `URL Configuration`
2. 配置以下设置：

**Site URL**（网站 URL）：
```
生产环境：https://mycq.ai
开发环境：http://localhost:3000
```

**Redirect URLs**（重定向 URL）- 添加以下所有 URL：
```
https://mycq.ai/auth/callback
https://mycq.ai/auth/confirm
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
```

**重要提示**：
- ✅ 每个 URL 必须单独添加（一行一个）
- ✅ 确保没有多余的空格或换行符
- ✅ 使用完整的 URL（包括协议 `https://` 或 `http://`）
- ✅ 点击 "Save" 保存配置

#### 1.3 验证配置

保存后，确认以下内容：
- [ ] Site URL 已正确设置
- [ ] 所有 4 个 Redirect URLs 都已添加
- [ ] 没有拼写错误或多余字符

---

### 步骤 2：配置 OAuth 提供商

#### 2.1 Google OAuth 配置

1. 在 Supabase Dashboard 中：
   - 进入：`Authentication` → `Providers` → `Google`
   - 确认 "Enabled" 已开启
   - 检查 "Authorized redirect URIs"

2. 在 Google Cloud Console 中：
   - 访问：https://console.cloud.google.com/apis/credentials
   - 选择你的 OAuth 2.0 客户端 ID
   - 在 "Authorized redirect URIs" 中添加：
     ```
     https://zzilbkehuxvbajupambt.supabase.co/auth/v1/callback
     ```

#### 2.2 Microsoft OAuth 配置

1. 在 Supabase Dashboard 中：
   - 进入：`Authentication` → `Providers` → `Azure (Microsoft)`
   - 确认 "Enabled" 已开启
   - 检查配置

2. 在 Azure Portal 中：
   - 访问：https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
   - 选择你的应用注册
   - 进入 "Authentication" → "Platform configurations" → "Web"
   - 在 "Redirect URIs" 中添加：
     ```
     https://zzilbkehuxvbajupambt.supabase.co/auth/v1/callback
     ```

---

### 步骤 3：测试修复

#### 3.1 清除浏览器缓存

```bash
# Chrome/Edge
1. 按 Ctrl+Shift+Delete (Windows) 或 Cmd+Shift+Delete (Mac)
2. 选择 "Cookies and other site data"
3. 选择 "Cached images and files"
4. 点击 "Clear data"
```

#### 3.2 测试登录流程

1. **测试 Google 登录**：
   - 访问：https://mycq.ai/login
   - 点击 "Sign in with Google"
   - 完成 Google 授权
   - 检查是否成功跳转到 dashboard

2. **测试 Microsoft 登录**：
   - 访问：https://mycq.ai/login
   - 点击 "Sign in with Microsoft"
   - 完成 Microsoft 授权
   - 检查是否成功跳转到 dashboard

3. **检查 Console 日志**：
   - 打开浏览器开发者工具（F12）
   - 查看 Console 标签
   - 应该看到详细的调试信息：
     ```
     === OAuth Callback Debug Info ===
     Full URL: https://mycq.ai/auth/callback?code=...
     Search params: { code: "..." }
     Hash params: {}
     ================================
     Code from query: abc123...
     Processing OAuth callback with code: abc123...
     OAuth login successful: user@example.com
     ```

---

## 🔍 调试工具

### 查看详细日志

更新后的 callback 页面会输出详细的调试信息：

```javascript
=== OAuth Callback Debug Info ===
Full URL: [完整的回调 URL]
Search params: [查询参数]
Hash params: [Hash 参数]
================================
```

### 常见日志输出

#### ✅ 成功的日志
```
Code from query: abc123...
Processing OAuth callback with code: abc123...
OAuth login successful: user@example.com
```

#### ❌ 失败的日志（配置错误）
```
Authorization code not found. Details: {
  url: "https://mycq.ai/auth/callback#",
  hasQueryParams: false,
  hasHashParams: false,
  queryParamKeys: [],
  hashParamKeys: []
}
```

---

## 🚨 常见问题

### 问题 1：URL 中没有 code 参数

**症状**：
- URL 显示为 `mycq.ai/auth/callback#`
- Console 显示："Authorization code not found"

**原因**：
- Supabase 的 Redirect URLs 配置不正确
- OAuth 提供商的回调 URL 配置不匹配

**解决**：
1. 检查 Supabase Dashboard 中的 Redirect URLs 配置
2. 确保包含 `https://mycq.ai/auth/callback`
3. 检查 OAuth 提供商的配置

### 问题 2：Code 在 hash fragment 中

**症状**：
- URL 显示为 `mycq.ai/auth/callback#code=xxx`
- 代码无法读取 code 参数

**原因**：
- OAuth 流程配置为 implicit flow 而不是 PKCE flow

**解决**：
更新后的代码已经支持从 hash fragment 中读取 code：
```typescript
// 如果查询参数中没有 code，尝试从 hash fragment 中获取
if (!code) {
  code = hashParams.get("code");
}
```

### 问题 3：Session 创建失败

**症状**：
- Code 参数存在
- 但是 `exchangeCodeForSession` 失败

**原因**：
- Code 已过期（通常 10 分钟有效期）
- Code 已被使用过
- Supabase 配置问题

**解决**：
1. 重新登录获取新的 code
2. 检查 Supabase 项目状态
3. 查看 Supabase Dashboard 的 Logs

---

## 📋 配置检查清单

### Supabase 配置
- [ ] Site URL 已设置为 `https://mycq.ai`
- [ ] Redirect URLs 包含 `https://mycq.ai/auth/callback`
- [ ] Redirect URLs 包含 `https://mycq.ai/auth/confirm`
- [ ] Redirect URLs 包含 `http://localhost:3000/auth/callback`
- [ ] Redirect URLs 包含 `http://localhost:3000/auth/confirm`
- [ ] Google OAuth 已启用
- [ ] Microsoft OAuth 已启用

### OAuth 提供商配置
- [ ] Google Cloud Console 中的 Redirect URI 包含 Supabase 回调 URL
- [ ] Azure Portal 中的 Redirect URI 包含 Supabase 回调 URL

### 代码更新
- [ ] `src/app/auth/callback/page.tsx` 已更新
- [ ] 代码包含详细的调试日志
- [ ] 代码支持从 hash fragment 读取 code

---

## 🎯 预期结果

配置正确后，登录流程应该是：

1. **用户点击 OAuth 登录按钮**
   - 页面跳转到 OAuth 提供商（Google/Microsoft）

2. **用户完成授权**
   - OAuth 提供商重定向到：`https://mycq.ai/auth/callback?code=xxx`

3. **Callback 页面处理**
   - 提取 code 参数
   - 调用 `exchangeCodeForSession(code)`
   - 创建用户会话

4. **成功跳转**
   - 重定向到 dashboard：`https://mycq.ai/`
   - 用户看到欢迎页面

---

## 📚 相关文档

- **Supabase OAuth 文档**：https://supabase.com/docs/guides/auth/social-login
- **Supabase PKCE Flow**：https://supabase.com/docs/guides/auth/sessions/pkce-flow
- **Google OAuth 配置**：https://supabase.com/docs/guides/auth/social-login/auth-google
- **Microsoft OAuth 配置**：https://supabase.com/docs/guides/auth/social-login/auth-azure

---

**修复指南版本**：v1.0  
**最后更新**：2025-01-10  
**问题状态**：已提供完整解决方案，等待用户配置和测试

