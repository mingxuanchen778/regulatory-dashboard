#!/bin/bash

# Git 推送脚本 - 认证系统（阶段 1-4）
# 此脚本将所有认证相关文件推送到 GitHub main 分支

echo "=========================================="
echo "开始推送认证系统代码到 GitHub"
echo "=========================================="

# 1. 检查当前分支
echo ""
echo "1. 检查当前分支..."
git branch

# 2. 检查 Git 状态
echo ""
echo "2. 检查 Git 状态..."
git status

# 3. 添加所有认证相关文件到暂存区
echo ""
echo "3. 添加文件到暂存区..."

# 阶段 1 文件
git add src/contexts/AuthContext.tsx
git add src/app/login/page.tsx
git add src/app/auth/callback/page.tsx
git add src/middleware.ts
git add src/app/layout.tsx
git add src/components/Sidebar.tsx
git add src/app/page.tsx

# 阶段 2 文件
git add src/app/signup/page.tsx

# 阶段 4 文件
git add src/app/auth/confirm/page.tsx
git add src/app/forgot-password/page.tsx
git add src/app/reset-password/page.tsx

# 文档文件
git add docs/AUTHENTICATION_TESTING_GUIDE.md

echo "所有文件已添加到暂存区"

# 4. 查看暂存区状态
echo ""
echo "4. 查看暂存区状态..."
git status

# 5. 创建提交
echo ""
echo "5. 创建提交..."
git commit -m "feat: 完成认证系统实现（阶段 1-4）

阶段 1：基础认证功能
- 创建 AuthContext 统一管理认证状态
- 实现登录页面（Email/Password、Microsoft OAuth、Google OAuth）
- 实现 OAuth 回调处理
- 添加路由保护 middleware
- 集成 AuthProvider 到根布局
- 更新 Sidebar 和首页显示真实用户信息

阶段 2：注册功能
- 创建注册页面，支持三种注册方式
- 实现完整的表单验证

阶段 4：邮箱验证和密码重置
- 创建统一的邮箱验证和密码重置确认页面
- 实现忘记密码流程
- 实现密码重置流程
- 扩展 AuthContext 添加密码重置方法
- 优化注册页面的邮箱验证处理

文档：
- 添加完整的认证系统测试指南

文件清单：
- src/contexts/AuthContext.tsx
- src/app/login/page.tsx
- src/app/auth/callback/page.tsx
- src/middleware.ts
- src/app/layout.tsx
- src/components/Sidebar.tsx
- src/app/page.tsx
- src/app/signup/page.tsx
- src/app/auth/confirm/page.tsx
- src/app/forgot-password/page.tsx
- src/app/reset-password/page.tsx
- docs/AUTHENTICATION_TESTING_GUIDE.md"

# 6. 推送到 GitHub
echo ""
echo "6. 推送到 GitHub main 分支..."
git push origin main

# 7. 完成
echo ""
echo "=========================================="
echo "推送完成！"
echo "=========================================="
echo ""
echo "请访问 GitHub 仓库确认："
echo "https://github.com/mingxuanchen778/regulatory-dashboard"

